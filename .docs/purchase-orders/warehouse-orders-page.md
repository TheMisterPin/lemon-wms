# Component: Warehouse Orders Page

## General overview

This is the floor-facing purchase order operations page.  
It helps operators focus on active work by status and provides one-click state actions.

## What it does

- shows three status cards (released, executing, paused)
- filters order list by selected status card
- displays status indicators with clear colors
- provides start/resume/pause actions at row level
- shows errors and loading states clearly

## Interaction model

- click a status card to filter table
- click same card again to clear filter
- use row action icons to change execution state

## How actions are decided

- released rows can be started
- executing rows can be paused
- paused rows can be resumed
- unsupported rows ignore action clicks

## Fallback behavior

- if page is opened for unsupported order type, user sees a clear message instead of broken controls
