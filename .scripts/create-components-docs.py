#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parent.parent
SOURCE_ROOT = REPO_ROOT / 'src' / 'components'
COMPONENT_DOCS_ROOT = REPO_ROOT / '.docs' / 'developer' / 'refactors' / 'components'

INCLUDED_SUFFIXES = {'.ts', '.tsx'}
EXCLUDED_FILE_PATTERNS = (
	'.d.ts',
	'.test.ts',
	'.test.tsx',
	'.spec.ts',
	'.spec.tsx',
	'.stories.ts',
	'.stories.tsx'
)


@dataclass
class GenerationStats:
	scanned: int = 0
	generated: int = 0
	skipped: int = 0
	hooks: int = 0
	components: int = 0
	misc: int = 0
	linked: int = 0


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(
		description='Generate markdown docs for files under src/components.'
	)
	parser.add_argument(
		'--source-root',
		type=Path,
		default=SOURCE_ROOT,
		help='Source components root (default: src/components).'
	)
	parser.add_argument(
		'--output-root',
		type=Path,
		default=COMPONENT_DOCS_ROOT,
		help='Output root for metadata docs.'
	)
	return parser.parse_args()


def to_kebab_case(value: str) -> str:
	normalized = re.sub(r'[_\s]+', '-', value)
	normalized = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', '-', normalized)
	normalized = re.sub(r'(?<=[A-Z])(?=[A-Z][a-z])', '-', normalized)
	normalized = re.sub(r'[^A-Za-z0-9-]+', '-', normalized)
	normalized = re.sub(r'-{2,}', '-', normalized)
	return normalized.strip('-').lower() or 'untitled'


def is_included_source(file_path: Path) -> bool:
	if file_path.name.startswith('.'):
		return False

	if file_path.suffix.lower() not in INCLUDED_SUFFIXES:
		return False

	lower_name = file_path.name.lower()
	if any(lower_name.endswith(pattern) for pattern in EXCLUDED_FILE_PATTERNS):
		return False

	return True


def is_hook_file(file_path: Path) -> bool:
	stem = file_path.stem
	return bool(re.match(r'^use[A-Z]', stem)) or stem.startswith('use-')


def is_kebab_case(value: str) -> bool:
	return bool(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', value))


def classify_type(file_path: Path) -> str:
	suffix = file_path.suffix.lower()
	is_hook = is_hook_file(file_path)

	if suffix == '.ts':
		return 'hook' if is_hook else 'misc'

	if suffix == '.tsx':
		return 'hook' if is_hook else 'component'

	raise ValueError(f'Unsupported file type for classification: {file_path}')


def make_output_path(
	source_file: Path,
	source_root: Path,
	output_root: Path
) -> tuple[Path, str]:
	relative_path = source_file.relative_to(source_root)
	relative_dir = relative_path.parent
	base_name = to_kebab_case(source_file.stem)
	entry_type = classify_type(source_file)
	target_path = output_root / entry_type / relative_dir / f'{base_name}.md'
	return target_path, entry_type


def render_doc_content(source_file: Path, source_root: Path, entry_type: str) -> str:
	relative_source = source_file.relative_to(source_root)
	correct_case = str(is_kebab_case(source_file.stem)).lower()
	return '\n'.join([
		'---',
		f'source: src/components/{relative_source.as_posix()}',
		f'type: {entry_type}',
		f'isCorrectCase: {correct_case}',
		'---',
		''
	])


def directive_line(line: str) -> bool:
	trimmed = line.strip()
	return trimmed in {
		"'use client'",
		"\"use client\"",
		"'use client';",
		"\"use client\";",
		"'use server'",
		"\"use server\"",
		"'use server';",
		"\"use server\";"
	}


def apply_doc_link_comment(source_file: Path, doc_path: Path) -> bool:
	original = source_file.read_text(encoding='utf-8')
	newline = '\r\n' if '\r\n' in original else '\n'
	lines = original.splitlines()

	doc_rel_path = doc_path.relative_to(REPO_ROOT).as_posix()
	new_block = [
		'/**',
		' * @generated-doc-link',
		f' * @doc {doc_rel_path}',
		' */'
	]

	comment_marker = '@generated-doc-link'
	marker_index = next((i for i, line in enumerate(lines) if comment_marker in line), None)

	if marker_index is not None:
		start = marker_index
		while start >= 0 and '/**' not in lines[start]:
			start -= 1

		end = marker_index
		while end < len(lines) and '*/' not in lines[end]:
			end += 1

		if start >= 0 and end < len(lines):
			lines[start:end + 1] = new_block
		else:
			lines = new_block + [''] + lines
	else:
		insert_index = 0
		while insert_index < len(lines) and directive_line(lines[insert_index]):
			insert_index += 1

		block_to_insert = new_block + ['']
		lines[insert_index:insert_index] = block_to_insert

	updated = newline.join(lines)
	if original.endswith(('\n', '\r\n')):
		updated += newline

	if updated == original:
		return False

	source_file.write_text(updated, encoding='utf-8')
	return True


def generate_docs(
	source_root: Path,
	output_root: Path
) -> GenerationStats:
	stats = GenerationStats()

	if not source_root.exists() or not source_root.is_dir():
		raise FileNotFoundError(f'Source root not found: {source_root}')

	for source_file in sorted(source_root.rglob('*')):
		if not source_file.is_file():
			continue

		stats.scanned += 1

		if not is_included_source(source_file):
			stats.skipped += 1
			continue

		output_path, entry_type = make_output_path(
			source_file=source_file,
			source_root=source_root,
			output_root=output_root
		)

		output_path.parent.mkdir(parents=True, exist_ok=True)
		output_path.write_text(
			render_doc_content(source_file, source_root, entry_type),
			encoding='utf-8'
		)

		if apply_doc_link_comment(source_file, output_path):
			stats.linked += 1

		stats.generated += 1
		if entry_type == 'hook':
			stats.hooks += 1
		elif entry_type == 'component':
			stats.components += 1
		else:
			stats.misc += 1

	return stats


def main() -> int:
	args = parse_args()

	source_root = args.source_root.resolve()
	output_root = args.output_root.resolve()

	try:
		stats = generate_docs(source_root, output_root)
	except Exception as exc:
		print(f'Error: {exc}')
		return 1

	print('Component docs generation complete')
	print(f'- Source root: {source_root}')
	print(f'- Output root: {output_root}')
	print(f'- Files scanned: {stats.scanned}')
	print(f'- Files generated: {stats.generated}')
	print(f'- Component docs: {stats.components}')
	print(f'- Hook docs: {stats.hooks}')
	print(f'- Misc docs: {stats.misc}')
	print(f'- Source files linked: {stats.linked}')
	print(f'- Files skipped: {stats.skipped}')

	return 0


if __name__ == '__main__':
	raise SystemExit(main())
