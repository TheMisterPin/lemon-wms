Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER', 'WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER');

-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('CREDENTIAL', 'BADGE_PIN', 'BOTH');

-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('RECEIVING', 'STORAGE', 'PICKING', 'PACKING', 'SHIPPING', 'QUARANTINE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BinType" AS ENUM ('RECEIVING', 'STORAGE', 'PICK_FACE', 'PACKING', 'SHIPPING', 'QUARANTINE', 'STAGING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BinItemStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'BLOCKED', 'IN_TRANSIT');

-- CreateEnum
CREATE TYPE "ItemTrackingMode" AS ENUM ('NONE', 'LOT', 'SERIAL', 'FIFO');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('ACTIVE', 'QUARANTINE', 'EXPIRED', 'CONSUMED');

-- CreateEnum
CREATE TYPE "SerialStatus" AS ENUM ('IN_STOCK', 'SHIPPED', 'RETURNED', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "SerialEntityType" AS ENUM ('ITEM', 'BOX', 'BOX_LINE', 'PALLET', 'ORDER', 'ORDER_LINE', 'USER');

-- CreateEnum
CREATE TYPE "SerialMode" AS ENUM ('INCREMENTAL', 'PARTIAL');

-- CreateEnum
CREATE TYPE "BoxStatus" AS ENUM ('OPEN', 'SEALED', 'IN_TRANSIT', 'RECEIVED', 'SHIPPED', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('NORMAL', 'URGENT', 'EXPRESS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'RELEASED', 'EXECUTING', 'PAUSED', 'EXECUTED', 'EXECUTED_WITH_PROBLEMS', 'SIGNED_OFF', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('PURCHASE', 'SALES', 'TRANSFER', 'RETURN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'TRANSFER');

-- CreateEnum
CREATE TYPE "AlertRuleType" AS ENUM ('LOW_STOCK', 'EXPIRY', 'BIN_CAPACITY');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('FLOOR');

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ZoneType" NOT NULL,
    "customPermissions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultReceivingBinId" TEXT,
    "defaultQuarantineBinId" TEXT,
    "defaultOutgoingBinId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bin" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "BinType" NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "maxWeightKg" DECIMAL(65,30),
    "maxVolumeM3" DECIMAL(65,30),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BinItem" (
    "id" TEXT NOT NULL,
    "binId" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "quantityAvailable" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quantityReserved" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quantityBlocked" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "uomCode" TEXT NOT NULL,
    "status" "BinItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BinItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "badgeNumber" TEXT NOT NULL,
    "pinHash" TEXT,
    "role" "Role" NOT NULL,
    "loginType" "LoginType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceLabel" TEXT NOT NULL,
    "deviceId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "DeviceType" NOT NULL DEFAULT 'FLOOR',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "zoneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "decimalRound" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WARItem" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "barcode" TEXT,
    "categoryId" TEXT NOT NULL,
    "trackingMode" "ItemTrackingMode" NOT NULL,
    "uomCode" TEXT NOT NULL,
    "weightKg" DECIMAL(65,30),
    "dimensions" JSONB,
    "minQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "supplierId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WARItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handlingFlags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" "LotStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerialNumber" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "entityType" "SerialEntityType" NOT NULL,
    "baseValue" INTEGER NOT NULL,
    "partialCurrent" INTEGER,
    "partialTotal" INTEGER,
    "status" "SerialStatus" NOT NULL DEFAULT 'IN_STOCK',
    "warItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SerialNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerialNumberConfig" (
    "id" TEXT NOT NULL,
    "entityType" "SerialEntityType" NOT NULL,
    "prefix" TEXT,
    "format" TEXT NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "incrementBy" INTEGER NOT NULL DEFAULT 1,
    "mode" "SerialMode" NOT NULL DEFAULT 'INCREMENTAL',
    "warItemId" TEXT,
    "warehouseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SerialNumberConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "BoxStatus" NOT NULL DEFAULT 'OPEN',
    "binId" TEXT,
    "warehouseId" TEXT NOT NULL,
    "weightKg" DECIMAL(65,30),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoxLine" (
    "id" TEXT NOT NULL,
    "boxId" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "uomCode" TEXT NOT NULL,

    CONSTRAINT "BoxLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
    "warehouseId" TEXT NOT NULL,
    "notes" TEXT,
    "supplier" TEXT NOT NULL,
    "expectedDate" TIMESTAMP(3),
    "receivingSequence" INTEGER,
    "createdById" TEXT NOT NULL,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "assignedWMId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderLine" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "binId" TEXT,
    "baseQuantity" DECIMAL(65,30) NOT NULL,
    "handledQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isShort" BOOLEAN NOT NULL DEFAULT false,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "uomCode" TEXT NOT NULL,

    CONSTRAINT "PurchaseOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
    "warehouseId" TEXT NOT NULL,
    "notes" TEXT,
    "customerName" TEXT NOT NULL,
    "deliveryAddress" TEXT,
    "carrierId" TEXT,
    "createdById" TEXT NOT NULL,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "assignedWMId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderLine" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "binId" TEXT,
    "baseQuantity" DECIMAL(65,30) NOT NULL,
    "handledQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isShort" BOOLEAN NOT NULL DEFAULT false,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "uomCode" TEXT NOT NULL,

    CONSTRAINT "SalesOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferOrder" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
    "warehouseId" TEXT NOT NULL,
    "notes" TEXT,
    "fromBinId" TEXT,
    "toBinId" TEXT,
    "isCrossWarehouse" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "assignedWMId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferOrderLine" (
    "id" TEXT NOT NULL,
    "transferOrderId" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "binId" TEXT,
    "baseQuantity" DECIMAL(65,30) NOT NULL,
    "handledQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isShort" BOOLEAN NOT NULL DEFAULT false,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "uomCode" TEXT NOT NULL,

    CONSTRAINT "TransferOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnOrder" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
    "warehouseId" TEXT NOT NULL,
    "notes" TEXT,
    "originSalesOrderId" TEXT,
    "returnDisposition" TEXT,
    "createdById" TEXT NOT NULL,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "assignedWMId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnOrderLine" (
    "id" TEXT NOT NULL,
    "returnOrderId" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "binId" TEXT,
    "baseQuantity" DECIMAL(65,30) NOT NULL,
    "handledQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isShort" BOOLEAN NOT NULL DEFAULT false,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "uomCode" TEXT NOT NULL,

    CONSTRAINT "ReturnOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdjustmentOrder" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
    "warehouseId" TEXT NOT NULL,
    "notes" TEXT,
    "reasonCode" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "assignedWMId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdjustmentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdjustmentOrderLine" (
    "id" TEXT NOT NULL,
    "adjustmentOrderId" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "binId" TEXT,
    "baseQuantity" DECIMAL(65,30) NOT NULL,
    "handledQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isShort" BOOLEAN NOT NULL DEFAULT false,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "uomCode" TEXT NOT NULL,

    CONSTRAINT "AdjustmentOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivityEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "warehouseId" TEXT,
    "orderId" TEXT,
    "orderType" "OrderType",
    "ipAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BinOperationEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromBinId" TEXT,
    "toBinId" TEXT,
    "warItemId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "orderId" TEXT,
    "orderType" "OrderType",
    "uaeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BinOperationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemLedgerEntry" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "warItemId" TEXT NOT NULL,
    "entryType" "LedgerEntryType" NOT NULL,
    "quantityChange" DECIMAL(65,30) NOT NULL,
    "lotId" TEXT,
    "serialNumberId" TEXT,
    "orderId" TEXT,
    "orderType" "OrderType",
    "boeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "type" "AlertRuleType" NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "warItemId" TEXT,
    "threshold" INTEGER NOT NULL,
    "recipientRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Zone_warehouseId_name_key" ON "Zone"("warehouseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Bin_code_key" ON "Bin"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BinItem_binId_warItemId_lotId_key" ON "BinItem"("binId", "warItemId", "lotId");

-- CreateIndex
CREATE UNIQUE INDEX "BinItem_binId_warItemId_serialNumberId_key" ON "BinItem"("binId", "warItemId", "serialNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_badgeNumber_key" ON "User"("badgeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Device_code_key" ON "Device"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Device_zoneId_key" ON "Device"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseAssignment_userId_warehouseId_zoneId_key" ON "WarehouseAssignment"("userId", "warehouseId", "zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "WARItem_sku_key" ON "WARItem"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_name_key" ON "ItemCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_lotNumber_key" ON "Lot"("lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SerialNumber_serial_key" ON "SerialNumber"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Box_code_key" ON "Box"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_reference_key" ON "PurchaseOrder"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_reference_key" ON "SalesOrder"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "TransferOrder_reference_key" ON "TransferOrder"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnOrder_reference_key" ON "ReturnOrder"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "AdjustmentOrder_reference_key" ON "AdjustmentOrder"("reference");

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bin" ADD CONSTRAINT "Bin_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bin" ADD CONSTRAINT "Bin_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinItem" ADD CONSTRAINT "BinItem_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinItem" ADD CONSTRAINT "BinItem_warItemId_fkey" FOREIGN KEY ("warItemId") REFERENCES "WARItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinItem" ADD CONSTRAINT "BinItem_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinItem" ADD CONSTRAINT "BinItem_serialNumberId_fkey" FOREIGN KEY ("serialNumberId") REFERENCES "SerialNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinItem" ADD CONSTRAINT "BinItem_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseAssignment" ADD CONSTRAINT "WarehouseAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseAssignment" ADD CONSTRAINT "WarehouseAssignment_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseAssignment" ADD CONSTRAINT "WarehouseAssignment_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WARItem" ADD CONSTRAINT "WARItem_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WARItem" ADD CONSTRAINT "WARItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_warItemId_fkey" FOREIGN KEY ("warItemId") REFERENCES "WARItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerialNumber" ADD CONSTRAINT "SerialNumber_configId_fkey" FOREIGN KEY ("configId") REFERENCES "SerialNumberConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerialNumber" ADD CONSTRAINT "SerialNumber_warItemId_fkey" FOREIGN KEY ("warItemId") REFERENCES "WARItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerialNumberConfig" ADD CONSTRAINT "SerialNumberConfig_warItemId_fkey" FOREIGN KEY ("warItemId") REFERENCES "WARItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerialNumberConfig" ADD CONSTRAINT "SerialNumberConfig_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxLine" ADD CONSTRAINT "BoxLine_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxLine" ADD CONSTRAINT "BoxLine_warItemId_fkey" FOREIGN KEY ("warItemId") REFERENCES "WARItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxLine" ADD CONSTRAINT "BoxLine_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxLine" ADD CONSTRAINT "BoxLine_serialNumberId_fkey" FOREIGN KEY ("serialNumberId") REFERENCES "SerialNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxLine" ADD CONSTRAINT "BoxLine_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferOrder" ADD CONSTRAINT "TransferOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferOrder" ADD CONSTRAINT "TransferOrder_fromBinId_fkey" FOREIGN KEY ("fromBinId") REFERENCES "Bin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferOrder" ADD CONSTRAINT "TransferOrder_toBinId_fkey" FOREIGN KEY ("toBinId") REFERENCES "Bin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferOrderLine" ADD CONSTRAINT "TransferOrderLine_transferOrderId_fkey" FOREIGN KEY ("transferOrderId") REFERENCES "TransferOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferOrderLine" ADD CONSTRAINT "TransferOrderLine_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnOrder" ADD CONSTRAINT "ReturnOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnOrderLine" ADD CONSTRAINT "ReturnOrderLine_returnOrderId_fkey" FOREIGN KEY ("returnOrderId") REFERENCES "ReturnOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnOrderLine" ADD CONSTRAINT "ReturnOrderLine_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustmentOrder" ADD CONSTRAINT "AdjustmentOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustmentOrderLine" ADD CONSTRAINT "AdjustmentOrderLine_adjustmentOrderId_fkey" FOREIGN KEY ("adjustmentOrderId") REFERENCES "AdjustmentOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustmentOrderLine" ADD CONSTRAINT "AdjustmentOrderLine_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityEntry" ADD CONSTRAINT "UserActivityEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityEntry" ADD CONSTRAINT "UserActivityEntry_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinOperationEntry" ADD CONSTRAINT "BinOperationEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinOperationEntry" ADD CONSTRAINT "BinOperationEntry_uaeId_fkey" FOREIGN KEY ("uaeId") REFERENCES "UserActivityEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemLedgerEntry" ADD CONSTRAINT "ItemLedgerEntry_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemLedgerEntry" ADD CONSTRAINT "ItemLedgerEntry_boeId_fkey" FOREIGN KEY ("boeId") REFERENCES "BinOperationEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

