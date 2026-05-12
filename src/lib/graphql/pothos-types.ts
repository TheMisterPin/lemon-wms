/* eslint-disable */
import type { Prisma, UnitOfMeasure, ItemCategory, Item, SerialNumberConfig, User, Device, RefreshToken, DeviceSession, Trolley, DeviceSyncEvent, WarehouseAssignment, Warehouse, Zone, Bin, UserActivityEntry, BinOperationEntry, ItemLedgerEntry, OrderAssignment, OrderExecutionActivity, BinHistory, PurchaseOrder, PurchaseOrderReceipt, PurchaseOrderLine, PurchaseOrderReceiptLine, SalesOrder, SalesOrderLine, TransferOrder, TransferOrderLine, ReturnOrder, ReturnOrderLine, AdjustmentOrder, AdjustmentOrderLine, BusinessParty, ContactPerson, Address, BinStockItem, Lot, SerialNumber, Box, BoxLine, Notification, Error, AlertRule } from "../../generated/prisma/index.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    UnitOfMeasure: {
        Name: "UnitOfMeasure";
        Shape: UnitOfMeasure;
        Include: Prisma.UnitOfMeasureInclude;
        Select: Prisma.UnitOfMeasureSelect;
        OrderBy: Prisma.UnitOfMeasureOrderByWithRelationInput;
        WhereUnique: Prisma.UnitOfMeasureWhereUniqueInput;
        Where: Prisma.UnitOfMeasureWhereInput;
        Create: {};
        Update: {};
        RelationName: "items" | "binStockItems" | "boxLines" | "purchaseOrderLines" | "salesOrderLines" | "transferOrderLines" | "returnOrderLines" | "adjustmentOrderLines" | "binOperationEntries" | "itemLedgerEntries";
        ListRelations: "items" | "binStockItems" | "boxLines" | "purchaseOrderLines" | "salesOrderLines" | "transferOrderLines" | "returnOrderLines" | "adjustmentOrderLines" | "binOperationEntries" | "itemLedgerEntries";
        Relations: {
            items: {
                Shape: Item[];
                Name: "Item";
                Nullable: false;
            };
            binStockItems: {
                Shape: BinStockItem[];
                Name: "BinStockItem";
                Nullable: false;
            };
            boxLines: {
                Shape: BoxLine[];
                Name: "BoxLine";
                Nullable: false;
            };
            purchaseOrderLines: {
                Shape: PurchaseOrderLine[];
                Name: "PurchaseOrderLine";
                Nullable: false;
            };
            salesOrderLines: {
                Shape: SalesOrderLine[];
                Name: "SalesOrderLine";
                Nullable: false;
            };
            transferOrderLines: {
                Shape: TransferOrderLine[];
                Name: "TransferOrderLine";
                Nullable: false;
            };
            returnOrderLines: {
                Shape: ReturnOrderLine[];
                Name: "ReturnOrderLine";
                Nullable: false;
            };
            adjustmentOrderLines: {
                Shape: AdjustmentOrderLine[];
                Name: "AdjustmentOrderLine";
                Nullable: false;
            };
            binOperationEntries: {
                Shape: BinOperationEntry[];
                Name: "BinOperationEntry";
                Nullable: false;
            };
            itemLedgerEntries: {
                Shape: ItemLedgerEntry[];
                Name: "ItemLedgerEntry";
                Nullable: false;
            };
        };
    };
    ItemCategory: {
        Name: "ItemCategory";
        Shape: ItemCategory;
        Include: Prisma.ItemCategoryInclude;
        Select: Prisma.ItemCategorySelect;
        OrderBy: Prisma.ItemCategoryOrderByWithRelationInput;
        WhereUnique: Prisma.ItemCategoryWhereUniqueInput;
        Where: Prisma.ItemCategoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "parent" | "children" | "items";
        ListRelations: "children" | "items";
        Relations: {
            parent: {
                Shape: ItemCategory | null;
                Name: "ItemCategory";
                Nullable: true;
            };
            children: {
                Shape: ItemCategory[];
                Name: "ItemCategory";
                Nullable: false;
            };
            items: {
                Shape: Item[];
                Name: "Item";
                Nullable: false;
            };
        };
    };
    Item: {
        Name: "Item";
        Shape: Item;
        Include: Prisma.ItemInclude;
        Select: Prisma.ItemSelect;
        OrderBy: Prisma.ItemOrderByWithRelationInput;
        WhereUnique: Prisma.ItemWhereUniqueInput;
        Where: Prisma.ItemWhereInput;
        Create: {};
        Update: {};
        RelationName: "category" | "supplier" | "unitOfMeasure" | "binStockItems" | "lots" | "serialNumbers" | "serialNumberConfigs";
        ListRelations: "binStockItems" | "lots" | "serialNumbers" | "serialNumberConfigs";
        Relations: {
            category: {
                Shape: ItemCategory | null;
                Name: "ItemCategory";
                Nullable: true;
            };
            supplier: {
                Shape: BusinessParty | null;
                Name: "BusinessParty";
                Nullable: true;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
            binStockItems: {
                Shape: BinStockItem[];
                Name: "BinStockItem";
                Nullable: false;
            };
            lots: {
                Shape: Lot[];
                Name: "Lot";
                Nullable: false;
            };
            serialNumbers: {
                Shape: SerialNumber[];
                Name: "SerialNumber";
                Nullable: false;
            };
            serialNumberConfigs: {
                Shape: SerialNumberConfig[];
                Name: "SerialNumberConfig";
                Nullable: false;
            };
        };
    };
    SerialNumberConfig: {
        Name: "SerialNumberConfig";
        Shape: SerialNumberConfig;
        Include: Prisma.SerialNumberConfigInclude;
        Select: Prisma.SerialNumberConfigSelect;
        OrderBy: Prisma.SerialNumberConfigOrderByWithRelationInput;
        WhereUnique: Prisma.SerialNumberConfigWhereUniqueInput;
        Where: Prisma.SerialNumberConfigWhereInput;
        Create: {};
        Update: {};
        RelationName: "item" | "warehouse" | "serials";
        ListRelations: "serials";
        Relations: {
            item: {
                Shape: Item | null;
                Name: "Item";
                Nullable: true;
            };
            warehouse: {
                Shape: Warehouse | null;
                Name: "Warehouse";
                Nullable: true;
            };
            serials: {
                Shape: SerialNumber[];
                Name: "SerialNumber";
                Nullable: false;
            };
        };
    };
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "lastLoginDevice" | "refreshTokens" | "deviceSessions" | "warehouseAssignments" | "userActivityEntries" | "binOperationEntries" | "notifications" | "orderAssignments" | "usedByDevices" | "activeTrolleys" | "createdWarehouses" | "orderExecutionActivities";
        ListRelations: "refreshTokens" | "deviceSessions" | "warehouseAssignments" | "userActivityEntries" | "binOperationEntries" | "notifications" | "orderAssignments" | "usedByDevices" | "activeTrolleys" | "createdWarehouses" | "orderExecutionActivities";
        Relations: {
            lastLoginDevice: {
                Shape: Device | null;
                Name: "Device";
                Nullable: true;
            };
            refreshTokens: {
                Shape: RefreshToken[];
                Name: "RefreshToken";
                Nullable: false;
            };
            deviceSessions: {
                Shape: DeviceSession[];
                Name: "DeviceSession";
                Nullable: false;
            };
            warehouseAssignments: {
                Shape: WarehouseAssignment[];
                Name: "WarehouseAssignment";
                Nullable: false;
            };
            userActivityEntries: {
                Shape: UserActivityEntry[];
                Name: "UserActivityEntry";
                Nullable: false;
            };
            binOperationEntries: {
                Shape: BinOperationEntry[];
                Name: "BinOperationEntry";
                Nullable: false;
            };
            notifications: {
                Shape: Notification[];
                Name: "Notification";
                Nullable: false;
            };
            orderAssignments: {
                Shape: OrderAssignment[];
                Name: "OrderAssignment";
                Nullable: false;
            };
            usedByDevices: {
                Shape: Device[];
                Name: "Device";
                Nullable: false;
            };
            activeTrolleys: {
                Shape: Trolley[];
                Name: "Trolley";
                Nullable: false;
            };
            createdWarehouses: {
                Shape: Warehouse[];
                Name: "Warehouse";
                Nullable: false;
            };
            orderExecutionActivities: {
                Shape: OrderExecutionActivity[];
                Name: "OrderExecutionActivity";
                Nullable: false;
            };
        };
    };
    Device: {
        Name: "Device";
        Shape: Device;
        Include: Prisma.DeviceInclude;
        Select: Prisma.DeviceSelect;
        OrderBy: Prisma.DeviceOrderByWithRelationInput;
        WhereUnique: Prisma.DeviceWhereUniqueInput;
        Where: Prisma.DeviceWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse" | "zone" | "lastUser" | "loggedInByUsers" | "refreshTokens" | "deviceSessions" | "syncEvents" | "trolley" | "userActivityEntries" | "binOperationEntries" | "orderAssignments" | "orderExecutionActivities" | "transitBinStockItems";
        ListRelations: "loggedInByUsers" | "refreshTokens" | "deviceSessions" | "syncEvents" | "userActivityEntries" | "binOperationEntries" | "orderAssignments" | "orderExecutionActivities" | "transitBinStockItems";
        Relations: {
            warehouse: {
                Shape: Warehouse | null;
                Name: "Warehouse";
                Nullable: true;
            };
            zone: {
                Shape: Zone | null;
                Name: "Zone";
                Nullable: true;
            };
            lastUser: {
                Shape: User | null;
                Name: "User";
                Nullable: true;
            };
            loggedInByUsers: {
                Shape: User[];
                Name: "User";
                Nullable: false;
            };
            refreshTokens: {
                Shape: RefreshToken[];
                Name: "RefreshToken";
                Nullable: false;
            };
            deviceSessions: {
                Shape: DeviceSession[];
                Name: "DeviceSession";
                Nullable: false;
            };
            syncEvents: {
                Shape: DeviceSyncEvent[];
                Name: "DeviceSyncEvent";
                Nullable: false;
            };
            trolley: {
                Shape: Trolley | null;
                Name: "Trolley";
                Nullable: true;
            };
            userActivityEntries: {
                Shape: UserActivityEntry[];
                Name: "UserActivityEntry";
                Nullable: false;
            };
            binOperationEntries: {
                Shape: BinOperationEntry[];
                Name: "BinOperationEntry";
                Nullable: false;
            };
            orderAssignments: {
                Shape: OrderAssignment[];
                Name: "OrderAssignment";
                Nullable: false;
            };
            orderExecutionActivities: {
                Shape: OrderExecutionActivity[];
                Name: "OrderExecutionActivity";
                Nullable: false;
            };
            transitBinStockItems: {
                Shape: BinStockItem[];
                Name: "BinStockItem";
                Nullable: false;
            };
        };
    };
    RefreshToken: {
        Name: "RefreshToken";
        Shape: RefreshToken;
        Include: Prisma.RefreshTokenInclude;
        Select: Prisma.RefreshTokenSelect;
        OrderBy: Prisma.RefreshTokenOrderByWithRelationInput;
        WhereUnique: Prisma.RefreshTokenWhereUniqueInput;
        Where: Prisma.RefreshTokenWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "device" | "deviceSession";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            device: {
                Shape: Device | null;
                Name: "Device";
                Nullable: true;
            };
            deviceSession: {
                Shape: DeviceSession | null;
                Name: "DeviceSession";
                Nullable: true;
            };
        };
    };
    DeviceSession: {
        Name: "DeviceSession";
        Shape: DeviceSession;
        Include: Prisma.DeviceSessionInclude;
        Select: Prisma.DeviceSessionSelect;
        OrderBy: Prisma.DeviceSessionOrderByWithRelationInput;
        WhereUnique: Prisma.DeviceSessionWhereUniqueInput;
        Where: Prisma.DeviceSessionWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "device" | "warehouse" | "zone" | "refreshTokens";
        ListRelations: "refreshTokens";
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            device: {
                Shape: Device;
                Name: "Device";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse | null;
                Name: "Warehouse";
                Nullable: true;
            };
            zone: {
                Shape: Zone | null;
                Name: "Zone";
                Nullable: true;
            };
            refreshTokens: {
                Shape: RefreshToken[];
                Name: "RefreshToken";
                Nullable: false;
            };
        };
    };
    Trolley: {
        Name: "Trolley";
        Shape: Trolley;
        Include: Prisma.TrolleyInclude;
        Select: Prisma.TrolleySelect;
        OrderBy: Prisma.TrolleyOrderByWithRelationInput;
        WhereUnique: Prisma.TrolleyWhereUniqueInput;
        Where: Prisma.TrolleyWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse" | "currentDevice" | "currentUser" | "transitBinStockItems" | "userActivityEntries" | "binOperationEntries" | "orderAssignments" | "orderExecutionActivities" | "syncEvents";
        ListRelations: "transitBinStockItems" | "userActivityEntries" | "binOperationEntries" | "orderAssignments" | "orderExecutionActivities" | "syncEvents";
        Relations: {
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            currentDevice: {
                Shape: Device | null;
                Name: "Device";
                Nullable: true;
            };
            currentUser: {
                Shape: User | null;
                Name: "User";
                Nullable: true;
            };
            transitBinStockItems: {
                Shape: BinStockItem[];
                Name: "BinStockItem";
                Nullable: false;
            };
            userActivityEntries: {
                Shape: UserActivityEntry[];
                Name: "UserActivityEntry";
                Nullable: false;
            };
            binOperationEntries: {
                Shape: BinOperationEntry[];
                Name: "BinOperationEntry";
                Nullable: false;
            };
            orderAssignments: {
                Shape: OrderAssignment[];
                Name: "OrderAssignment";
                Nullable: false;
            };
            orderExecutionActivities: {
                Shape: OrderExecutionActivity[];
                Name: "OrderExecutionActivity";
                Nullable: false;
            };
            syncEvents: {
                Shape: DeviceSyncEvent[];
                Name: "DeviceSyncEvent";
                Nullable: false;
            };
        };
    };
    DeviceSyncEvent: {
        Name: "DeviceSyncEvent";
        Shape: DeviceSyncEvent;
        Include: Prisma.DeviceSyncEventInclude;
        Select: Prisma.DeviceSyncEventSelect;
        OrderBy: Prisma.DeviceSyncEventOrderByWithRelationInput;
        WhereUnique: Prisma.DeviceSyncEventWhereUniqueInput;
        Where: Prisma.DeviceSyncEventWhereInput;
        Create: {};
        Update: {};
        RelationName: "device" | "trolley";
        ListRelations: never;
        Relations: {
            device: {
                Shape: Device;
                Name: "Device";
                Nullable: false;
            };
            trolley: {
                Shape: Trolley | null;
                Name: "Trolley";
                Nullable: true;
            };
        };
    };
    WarehouseAssignment: {
        Name: "WarehouseAssignment";
        Shape: WarehouseAssignment;
        Include: Prisma.WarehouseAssignmentInclude;
        Select: Prisma.WarehouseAssignmentSelect;
        OrderBy: Prisma.WarehouseAssignmentOrderByWithRelationInput;
        WhereUnique: Prisma.WarehouseAssignmentWhereUniqueInput;
        Where: Prisma.WarehouseAssignmentWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "warehouse" | "zone";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            zone: {
                Shape: Zone | null;
                Name: "Zone";
                Nullable: true;
            };
        };
    };
    Warehouse: {
        Name: "Warehouse";
        Shape: Warehouse;
        Include: Prisma.WarehouseInclude;
        Select: Prisma.WarehouseSelect;
        OrderBy: Prisma.WarehouseOrderByWithRelationInput;
        WhereUnique: Prisma.WarehouseWhereUniqueInput;
        Where: Prisma.WarehouseWhereInput;
        Create: {};
        Update: {};
        RelationName: "createdBy" | "zones" | "bins" | "assignments" | "devices" | "deviceSessions" | "trolleys" | "purchaseOrders" | "purchaseOrderReceipts" | "salesOrders" | "transferOrders" | "returnOrders" | "adjustOrders" | "binOperationEntries" | "itemLedger" | "uaeEntries" | "orderAssignments" | "orderExecutionActivities" | "alertRules" | "serialConfigs" | "boxes";
        ListRelations: "zones" | "bins" | "assignments" | "devices" | "deviceSessions" | "trolleys" | "purchaseOrders" | "purchaseOrderReceipts" | "salesOrders" | "transferOrders" | "returnOrders" | "adjustOrders" | "binOperationEntries" | "itemLedger" | "uaeEntries" | "orderAssignments" | "orderExecutionActivities" | "alertRules" | "serialConfigs" | "boxes";
        Relations: {
            createdBy: {
                Shape: User | null;
                Name: "User";
                Nullable: true;
            };
            zones: {
                Shape: Zone[];
                Name: "Zone";
                Nullable: false;
            };
            bins: {
                Shape: Bin[];
                Name: "Bin";
                Nullable: false;
            };
            assignments: {
                Shape: WarehouseAssignment[];
                Name: "WarehouseAssignment";
                Nullable: false;
            };
            devices: {
                Shape: Device[];
                Name: "Device";
                Nullable: false;
            };
            deviceSessions: {
                Shape: DeviceSession[];
                Name: "DeviceSession";
                Nullable: false;
            };
            trolleys: {
                Shape: Trolley[];
                Name: "Trolley";
                Nullable: false;
            };
            purchaseOrders: {
                Shape: PurchaseOrder[];
                Name: "PurchaseOrder";
                Nullable: false;
            };
            purchaseOrderReceipts: {
                Shape: PurchaseOrderReceipt[];
                Name: "PurchaseOrderReceipt";
                Nullable: false;
            };
            salesOrders: {
                Shape: SalesOrder[];
                Name: "SalesOrder";
                Nullable: false;
            };
            transferOrders: {
                Shape: TransferOrder[];
                Name: "TransferOrder";
                Nullable: false;
            };
            returnOrders: {
                Shape: ReturnOrder[];
                Name: "ReturnOrder";
                Nullable: false;
            };
            adjustOrders: {
                Shape: AdjustmentOrder[];
                Name: "AdjustmentOrder";
                Nullable: false;
            };
            binOperationEntries: {
                Shape: BinOperationEntry[];
                Name: "BinOperationEntry";
                Nullable: false;
            };
            itemLedger: {
                Shape: ItemLedgerEntry[];
                Name: "ItemLedgerEntry";
                Nullable: false;
            };
            uaeEntries: {
                Shape: UserActivityEntry[];
                Name: "UserActivityEntry";
                Nullable: false;
            };
            orderAssignments: {
                Shape: OrderAssignment[];
                Name: "OrderAssignment";
                Nullable: false;
            };
            orderExecutionActivities: {
                Shape: OrderExecutionActivity[];
                Name: "OrderExecutionActivity";
                Nullable: false;
            };
            alertRules: {
                Shape: AlertRule[];
                Name: "AlertRule";
                Nullable: false;
            };
            serialConfigs: {
                Shape: SerialNumberConfig[];
                Name: "SerialNumberConfig";
                Nullable: false;
            };
            boxes: {
                Shape: Box[];
                Name: "Box";
                Nullable: false;
            };
        };
    };
    Zone: {
        Name: "Zone";
        Shape: Zone;
        Include: Prisma.ZoneInclude;
        Select: Prisma.ZoneSelect;
        OrderBy: Prisma.ZoneOrderByWithRelationInput;
        WhereUnique: Prisma.ZoneWhereUniqueInput;
        Where: Prisma.ZoneWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse" | "zoneExecutionActivities" | "userActivityEntries" | "binOperationEntries" | "itemLedgerEntries" | "orderAssignments" | "bins" | "assignments" | "deviceSessions" | "devices";
        ListRelations: "zoneExecutionActivities" | "userActivityEntries" | "binOperationEntries" | "itemLedgerEntries" | "orderAssignments" | "bins" | "assignments" | "deviceSessions" | "devices";
        Relations: {
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            zoneExecutionActivities: {
                Shape: OrderExecutionActivity[];
                Name: "OrderExecutionActivity";
                Nullable: false;
            };
            userActivityEntries: {
                Shape: UserActivityEntry[];
                Name: "UserActivityEntry";
                Nullable: false;
            };
            binOperationEntries: {
                Shape: BinOperationEntry[];
                Name: "BinOperationEntry";
                Nullable: false;
            };
            itemLedgerEntries: {
                Shape: ItemLedgerEntry[];
                Name: "ItemLedgerEntry";
                Nullable: false;
            };
            orderAssignments: {
                Shape: OrderAssignment[];
                Name: "OrderAssignment";
                Nullable: false;
            };
            bins: {
                Shape: Bin[];
                Name: "Bin";
                Nullable: false;
            };
            assignments: {
                Shape: WarehouseAssignment[];
                Name: "WarehouseAssignment";
                Nullable: false;
            };
            deviceSessions: {
                Shape: DeviceSession[];
                Name: "DeviceSession";
                Nullable: false;
            };
            devices: {
                Shape: Device[];
                Name: "Device";
                Nullable: false;
            };
        };
    };
    Bin: {
        Name: "Bin";
        Shape: Bin;
        Include: Prisma.BinInclude;
        Select: Prisma.BinSelect;
        OrderBy: Prisma.BinOrderByWithRelationInput;
        WhereUnique: Prisma.BinWhereUniqueInput;
        Where: Prisma.BinWhereInput;
        Create: {};
        Update: {};
        RelationName: "zone" | "warehouse" | "binStockItems" | "boxes" | "binHistory" | "toTransfers" | "fromTransfers";
        ListRelations: "binStockItems" | "boxes" | "binHistory" | "toTransfers" | "fromTransfers";
        Relations: {
            zone: {
                Shape: Zone;
                Name: "Zone";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            binStockItems: {
                Shape: BinStockItem[];
                Name: "BinStockItem";
                Nullable: false;
            };
            boxes: {
                Shape: Box[];
                Name: "Box";
                Nullable: false;
            };
            binHistory: {
                Shape: BinHistory[];
                Name: "BinHistory";
                Nullable: false;
            };
            toTransfers: {
                Shape: TransferOrder[];
                Name: "TransferOrder";
                Nullable: false;
            };
            fromTransfers: {
                Shape: TransferOrder[];
                Name: "TransferOrder";
                Nullable: false;
            };
        };
    };
    UserActivityEntry: {
        Name: "UserActivityEntry";
        Shape: UserActivityEntry;
        Include: Prisma.UserActivityEntryInclude;
        Select: Prisma.UserActivityEntrySelect;
        OrderBy: Prisma.UserActivityEntryOrderByWithRelationInput;
        WhereUnique: Prisma.UserActivityEntryWhereUniqueInput;
        Where: Prisma.UserActivityEntryWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "warehouse" | "zone" | "device" | "trolley" | "boes";
        ListRelations: "boes";
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse | null;
                Name: "Warehouse";
                Nullable: true;
            };
            zone: {
                Shape: Zone | null;
                Name: "Zone";
                Nullable: true;
            };
            device: {
                Shape: Device | null;
                Name: "Device";
                Nullable: true;
            };
            trolley: {
                Shape: Trolley | null;
                Name: "Trolley";
                Nullable: true;
            };
            boes: {
                Shape: BinOperationEntry[];
                Name: "BinOperationEntry";
                Nullable: false;
            };
        };
    };
    BinOperationEntry: {
        Name: "BinOperationEntry";
        Shape: BinOperationEntry;
        Include: Prisma.BinOperationEntryInclude;
        Select: Prisma.BinOperationEntrySelect;
        OrderBy: Prisma.BinOperationEntryOrderByWithRelationInput;
        WhereUnique: Prisma.BinOperationEntryWhereUniqueInput;
        Where: Prisma.BinOperationEntryWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "warehouse" | "zone" | "device" | "trolley" | "unitOfMeasure" | "userActivityEntry" | "itemLedgers";
        ListRelations: "itemLedgers";
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            zone: {
                Shape: Zone | null;
                Name: "Zone";
                Nullable: true;
            };
            device: {
                Shape: Device | null;
                Name: "Device";
                Nullable: true;
            };
            trolley: {
                Shape: Trolley | null;
                Name: "Trolley";
                Nullable: true;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
            userActivityEntry: {
                Shape: UserActivityEntry | null;
                Name: "UserActivityEntry";
                Nullable: true;
            };
            itemLedgers: {
                Shape: ItemLedgerEntry[];
                Name: "ItemLedgerEntry";
                Nullable: false;
            };
        };
    };
    ItemLedgerEntry: {
        Name: "ItemLedgerEntry";
        Shape: ItemLedgerEntry;
        Include: Prisma.ItemLedgerEntryInclude;
        Select: Prisma.ItemLedgerEntrySelect;
        OrderBy: Prisma.ItemLedgerEntryOrderByWithRelationInput;
        WhereUnique: Prisma.ItemLedgerEntryWhereUniqueInput;
        Where: Prisma.ItemLedgerEntryWhereInput;
        Create: {};
        Update: {};
        RelationName: "boe" | "unitOfMeasure" | "warehouse" | "zone";
        ListRelations: never;
        Relations: {
            boe: {
                Shape: BinOperationEntry | null;
                Name: "BinOperationEntry";
                Nullable: true;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            zone: {
                Shape: Zone;
                Name: "Zone";
                Nullable: false;
            };
        };
    };
    OrderAssignment: {
        Name: "OrderAssignment";
        Shape: OrderAssignment;
        Include: Prisma.OrderAssignmentInclude;
        Select: Prisma.OrderAssignmentSelect;
        OrderBy: Prisma.OrderAssignmentOrderByWithRelationInput;
        WhereUnique: Prisma.OrderAssignmentWhereUniqueInput;
        Where: Prisma.OrderAssignmentWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "warehouse" | "activities" | "zone" | "device" | "trolley";
        ListRelations: "activities";
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            activities: {
                Shape: OrderExecutionActivity[];
                Name: "OrderExecutionActivity";
                Nullable: false;
            };
            zone: {
                Shape: Zone | null;
                Name: "Zone";
                Nullable: true;
            };
            device: {
                Shape: Device | null;
                Name: "Device";
                Nullable: true;
            };
            trolley: {
                Shape: Trolley | null;
                Name: "Trolley";
                Nullable: true;
            };
        };
    };
    OrderExecutionActivity: {
        Name: "OrderExecutionActivity";
        Shape: OrderExecutionActivity;
        Include: Prisma.OrderExecutionActivityInclude;
        Select: Prisma.OrderExecutionActivitySelect;
        OrderBy: Prisma.OrderExecutionActivityOrderByWithRelationInput;
        WhereUnique: Prisma.OrderExecutionActivityWhereUniqueInput;
        Where: Prisma.OrderExecutionActivityWhereInput;
        Create: {};
        Update: {};
        RelationName: "orderAssignment" | "user" | "warehouse" | "zone" | "device" | "trolley";
        ListRelations: never;
        Relations: {
            orderAssignment: {
                Shape: OrderAssignment;
                Name: "OrderAssignment";
                Nullable: false;
            };
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            zone: {
                Shape: Zone;
                Name: "Zone";
                Nullable: false;
            };
            device: {
                Shape: Device | null;
                Name: "Device";
                Nullable: true;
            };
            trolley: {
                Shape: Trolley | null;
                Name: "Trolley";
                Nullable: true;
            };
        };
    };
    BinHistory: {
        Name: "BinHistory";
        Shape: BinHistory;
        Include: Prisma.BinHistoryInclude;
        Select: Prisma.BinHistorySelect;
        OrderBy: Prisma.BinHistoryOrderByWithRelationInput;
        WhereUnique: Prisma.BinHistoryWhereUniqueInput;
        Where: Prisma.BinHistoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "bin";
        ListRelations: never;
        Relations: {
            bin: {
                Shape: Bin;
                Name: "Bin";
                Nullable: false;
            };
        };
    };
    PurchaseOrder: {
        Name: "PurchaseOrder";
        Shape: PurchaseOrder;
        Include: Prisma.PurchaseOrderInclude;
        Select: Prisma.PurchaseOrderSelect;
        OrderBy: Prisma.PurchaseOrderOrderByWithRelationInput;
        WhereUnique: Prisma.PurchaseOrderWhereUniqueInput;
        Where: Prisma.PurchaseOrderWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse" | "businessParty" | "lines" | "receipts";
        ListRelations: "lines" | "receipts";
        Relations: {
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            businessParty: {
                Shape: BusinessParty | null;
                Name: "BusinessParty";
                Nullable: true;
            };
            lines: {
                Shape: PurchaseOrderLine[];
                Name: "PurchaseOrderLine";
                Nullable: false;
            };
            receipts: {
                Shape: PurchaseOrderReceipt[];
                Name: "PurchaseOrderReceipt";
                Nullable: false;
            };
        };
    };
    PurchaseOrderReceipt: {
        Name: "PurchaseOrderReceipt";
        Shape: PurchaseOrderReceipt;
        Include: Prisma.PurchaseOrderReceiptInclude;
        Select: Prisma.PurchaseOrderReceiptSelect;
        OrderBy: Prisma.PurchaseOrderReceiptOrderByWithRelationInput;
        WhereUnique: Prisma.PurchaseOrderReceiptWhereUniqueInput;
        Where: Prisma.PurchaseOrderReceiptWhereInput;
        Create: {};
        Update: {};
        RelationName: "purchaseOrder" | "warehouse" | "lines";
        ListRelations: "lines";
        Relations: {
            purchaseOrder: {
                Shape: PurchaseOrder;
                Name: "PurchaseOrder";
                Nullable: false;
            };
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            lines: {
                Shape: PurchaseOrderReceiptLine[];
                Name: "PurchaseOrderReceiptLine";
                Nullable: false;
            };
        };
    };
    PurchaseOrderLine: {
        Name: "PurchaseOrderLine";
        Shape: PurchaseOrderLine;
        Include: Prisma.PurchaseOrderLineInclude;
        Select: Prisma.PurchaseOrderLineSelect;
        OrderBy: Prisma.PurchaseOrderLineOrderByWithRelationInput;
        WhereUnique: Prisma.PurchaseOrderLineWhereUniqueInput;
        Where: Prisma.PurchaseOrderLineWhereInput;
        Create: {};
        Update: {};
        RelationName: "purchaseOrder" | "unitOfMeasure" | "receiptLines";
        ListRelations: "receiptLines";
        Relations: {
            purchaseOrder: {
                Shape: PurchaseOrder;
                Name: "PurchaseOrder";
                Nullable: false;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
            receiptLines: {
                Shape: PurchaseOrderReceiptLine[];
                Name: "PurchaseOrderReceiptLine";
                Nullable: false;
            };
        };
    };
    PurchaseOrderReceiptLine: {
        Name: "PurchaseOrderReceiptLine";
        Shape: PurchaseOrderReceiptLine;
        Include: Prisma.PurchaseOrderReceiptLineInclude;
        Select: Prisma.PurchaseOrderReceiptLineSelect;
        OrderBy: Prisma.PurchaseOrderReceiptLineOrderByWithRelationInput;
        WhereUnique: Prisma.PurchaseOrderReceiptLineWhereUniqueInput;
        Where: Prisma.PurchaseOrderReceiptLineWhereInput;
        Create: {};
        Update: {};
        RelationName: "receiptLine" | "purchaseOrderLine" | "correctedLine" | "correctionLines" | "stockItems";
        ListRelations: "correctionLines" | "stockItems";
        Relations: {
            receiptLine: {
                Shape: PurchaseOrderReceipt;
                Name: "PurchaseOrderReceipt";
                Nullable: false;
            };
            purchaseOrderLine: {
                Shape: PurchaseOrderLine;
                Name: "PurchaseOrderLine";
                Nullable: false;
            };
            correctedLine: {
                Shape: PurchaseOrderReceiptLine | null;
                Name: "PurchaseOrderReceiptLine";
                Nullable: true;
            };
            correctionLines: {
                Shape: PurchaseOrderReceiptLine[];
                Name: "PurchaseOrderReceiptLine";
                Nullable: false;
            };
            stockItems: {
                Shape: BinStockItem[];
                Name: "BinStockItem";
                Nullable: false;
            };
        };
    };
    SalesOrder: {
        Name: "SalesOrder";
        Shape: SalesOrder;
        Include: Prisma.SalesOrderInclude;
        Select: Prisma.SalesOrderSelect;
        OrderBy: Prisma.SalesOrderOrderByWithRelationInput;
        WhereUnique: Prisma.SalesOrderWhereUniqueInput;
        Where: Prisma.SalesOrderWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse" | "businessParty" | "lines";
        ListRelations: "lines";
        Relations: {
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            businessParty: {
                Shape: BusinessParty | null;
                Name: "BusinessParty";
                Nullable: true;
            };
            lines: {
                Shape: SalesOrderLine[];
                Name: "SalesOrderLine";
                Nullable: false;
            };
        };
    };
    SalesOrderLine: {
        Name: "SalesOrderLine";
        Shape: SalesOrderLine;
        Include: Prisma.SalesOrderLineInclude;
        Select: Prisma.SalesOrderLineSelect;
        OrderBy: Prisma.SalesOrderLineOrderByWithRelationInput;
        WhereUnique: Prisma.SalesOrderLineWhereUniqueInput;
        Where: Prisma.SalesOrderLineWhereInput;
        Create: {};
        Update: {};
        RelationName: "salesOrder" | "unitOfMeasure";
        ListRelations: never;
        Relations: {
            salesOrder: {
                Shape: SalesOrder;
                Name: "SalesOrder";
                Nullable: false;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
        };
    };
    TransferOrder: {
        Name: "TransferOrder";
        Shape: TransferOrder;
        Include: Prisma.TransferOrderInclude;
        Select: Prisma.TransferOrderSelect;
        OrderBy: Prisma.TransferOrderOrderByWithRelationInput;
        WhereUnique: Prisma.TransferOrderWhereUniqueInput;
        Where: Prisma.TransferOrderWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse" | "originBin" | "destinationBin" | "lines";
        ListRelations: "lines";
        Relations: {
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            originBin: {
                Shape: Bin | null;
                Name: "Bin";
                Nullable: true;
            };
            destinationBin: {
                Shape: Bin | null;
                Name: "Bin";
                Nullable: true;
            };
            lines: {
                Shape: TransferOrderLine[];
                Name: "TransferOrderLine";
                Nullable: false;
            };
        };
    };
    TransferOrderLine: {
        Name: "TransferOrderLine";
        Shape: TransferOrderLine;
        Include: Prisma.TransferOrderLineInclude;
        Select: Prisma.TransferOrderLineSelect;
        OrderBy: Prisma.TransferOrderLineOrderByWithRelationInput;
        WhereUnique: Prisma.TransferOrderLineWhereUniqueInput;
        Where: Prisma.TransferOrderLineWhereInput;
        Create: {};
        Update: {};
        RelationName: "transferOrder" | "unitOfMeasure";
        ListRelations: never;
        Relations: {
            transferOrder: {
                Shape: TransferOrder;
                Name: "TransferOrder";
                Nullable: false;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
        };
    };
    ReturnOrder: {
        Name: "ReturnOrder";
        Shape: ReturnOrder;
        Include: Prisma.ReturnOrderInclude;
        Select: Prisma.ReturnOrderSelect;
        OrderBy: Prisma.ReturnOrderOrderByWithRelationInput;
        WhereUnique: Prisma.ReturnOrderWhereUniqueInput;
        Where: Prisma.ReturnOrderWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse" | "lines";
        ListRelations: "lines";
        Relations: {
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            lines: {
                Shape: ReturnOrderLine[];
                Name: "ReturnOrderLine";
                Nullable: false;
            };
        };
    };
    ReturnOrderLine: {
        Name: "ReturnOrderLine";
        Shape: ReturnOrderLine;
        Include: Prisma.ReturnOrderLineInclude;
        Select: Prisma.ReturnOrderLineSelect;
        OrderBy: Prisma.ReturnOrderLineOrderByWithRelationInput;
        WhereUnique: Prisma.ReturnOrderLineWhereUniqueInput;
        Where: Prisma.ReturnOrderLineWhereInput;
        Create: {};
        Update: {};
        RelationName: "returnOrder" | "unitOfMeasure";
        ListRelations: never;
        Relations: {
            returnOrder: {
                Shape: ReturnOrder;
                Name: "ReturnOrder";
                Nullable: false;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
        };
    };
    AdjustmentOrder: {
        Name: "AdjustmentOrder";
        Shape: AdjustmentOrder;
        Include: Prisma.AdjustmentOrderInclude;
        Select: Prisma.AdjustmentOrderSelect;
        OrderBy: Prisma.AdjustmentOrderOrderByWithRelationInput;
        WhereUnique: Prisma.AdjustmentOrderWhereUniqueInput;
        Where: Prisma.AdjustmentOrderWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse" | "lines";
        ListRelations: "lines";
        Relations: {
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            lines: {
                Shape: AdjustmentOrderLine[];
                Name: "AdjustmentOrderLine";
                Nullable: false;
            };
        };
    };
    AdjustmentOrderLine: {
        Name: "AdjustmentOrderLine";
        Shape: AdjustmentOrderLine;
        Include: Prisma.AdjustmentOrderLineInclude;
        Select: Prisma.AdjustmentOrderLineSelect;
        OrderBy: Prisma.AdjustmentOrderLineOrderByWithRelationInput;
        WhereUnique: Prisma.AdjustmentOrderLineWhereUniqueInput;
        Where: Prisma.AdjustmentOrderLineWhereInput;
        Create: {};
        Update: {};
        RelationName: "adjustmentOrder" | "unitOfMeasure";
        ListRelations: never;
        Relations: {
            adjustmentOrder: {
                Shape: AdjustmentOrder;
                Name: "AdjustmentOrder";
                Nullable: false;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
        };
    };
    BusinessParty: {
        Name: "BusinessParty";
        Shape: BusinessParty;
        Include: Prisma.BusinessPartyInclude;
        Select: Prisma.BusinessPartySelect;
        OrderBy: Prisma.BusinessPartyOrderByWithRelationInput;
        WhereUnique: Prisma.BusinessPartyWhereUniqueInput;
        Where: Prisma.BusinessPartyWhereInput;
        Create: {};
        Update: {};
        RelationName: "addresses" | "contacts" | "supplierItems" | "purchaseOrders" | "salesOrders";
        ListRelations: "addresses" | "contacts" | "supplierItems" | "purchaseOrders" | "salesOrders";
        Relations: {
            addresses: {
                Shape: ContactPerson[];
                Name: "ContactPerson";
                Nullable: false;
            };
            contacts: {
                Shape: Address[];
                Name: "Address";
                Nullable: false;
            };
            supplierItems: {
                Shape: Item[];
                Name: "Item";
                Nullable: false;
            };
            purchaseOrders: {
                Shape: PurchaseOrder[];
                Name: "PurchaseOrder";
                Nullable: false;
            };
            salesOrders: {
                Shape: SalesOrder[];
                Name: "SalesOrder";
                Nullable: false;
            };
        };
    };
    ContactPerson: {
        Name: "ContactPerson";
        Shape: ContactPerson;
        Include: Prisma.ContactPersonInclude;
        Select: Prisma.ContactPersonSelect;
        OrderBy: Prisma.ContactPersonOrderByWithRelationInput;
        WhereUnique: Prisma.ContactPersonWhereUniqueInput;
        Where: Prisma.ContactPersonWhereInput;
        Create: {};
        Update: {};
        RelationName: "businessParty";
        ListRelations: never;
        Relations: {
            businessParty: {
                Shape: BusinessParty;
                Name: "BusinessParty";
                Nullable: false;
            };
        };
    };
    Address: {
        Name: "Address";
        Shape: Address;
        Include: Prisma.AddressInclude;
        Select: Prisma.AddressSelect;
        OrderBy: Prisma.AddressOrderByWithRelationInput;
        WhereUnique: Prisma.AddressWhereUniqueInput;
        Where: Prisma.AddressWhereInput;
        Create: {};
        Update: {};
        RelationName: "businessParty";
        ListRelations: never;
        Relations: {
            businessParty: {
                Shape: BusinessParty;
                Name: "BusinessParty";
                Nullable: false;
            };
        };
    };
    BinStockItem: {
        Name: "BinStockItem";
        Shape: BinStockItem;
        Include: Prisma.BinStockItemInclude;
        Select: Prisma.BinStockItemSelect;
        OrderBy: Prisma.BinStockItemOrderByWithRelationInput;
        WhereUnique: Prisma.BinStockItemWhereUniqueInput;
        Where: Prisma.BinStockItemWhereInput;
        Create: {};
        Update: {};
        RelationName: "purchaseOrderReceiptLines" | "bin" | "item" | "lot" | "serialNumber" | "unitOfMeasure" | "transitDevice" | "transitTrolley" | "boxLines";
        ListRelations: "purchaseOrderReceiptLines" | "boxLines";
        Relations: {
            purchaseOrderReceiptLines: {
                Shape: PurchaseOrderReceiptLine[];
                Name: "PurchaseOrderReceiptLine";
                Nullable: false;
            };
            bin: {
                Shape: Bin;
                Name: "Bin";
                Nullable: false;
            };
            item: {
                Shape: Item;
                Name: "Item";
                Nullable: false;
            };
            lot: {
                Shape: Lot | null;
                Name: "Lot";
                Nullable: true;
            };
            serialNumber: {
                Shape: SerialNumber | null;
                Name: "SerialNumber";
                Nullable: true;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
            transitDevice: {
                Shape: Device | null;
                Name: "Device";
                Nullable: true;
            };
            transitTrolley: {
                Shape: Trolley | null;
                Name: "Trolley";
                Nullable: true;
            };
            boxLines: {
                Shape: BoxLine[];
                Name: "BoxLine";
                Nullable: false;
            };
        };
    };
    Lot: {
        Name: "Lot";
        Shape: Lot;
        Include: Prisma.LotInclude;
        Select: Prisma.LotSelect;
        OrderBy: Prisma.LotOrderByWithRelationInput;
        WhereUnique: Prisma.LotWhereUniqueInput;
        Where: Prisma.LotWhereInput;
        Create: {};
        Update: {};
        RelationName: "item" | "binStockItems" | "boxLines";
        ListRelations: "binStockItems" | "boxLines";
        Relations: {
            item: {
                Shape: Item | null;
                Name: "Item";
                Nullable: true;
            };
            binStockItems: {
                Shape: BinStockItem[];
                Name: "BinStockItem";
                Nullable: false;
            };
            boxLines: {
                Shape: BoxLine[];
                Name: "BoxLine";
                Nullable: false;
            };
        };
    };
    SerialNumber: {
        Name: "SerialNumber";
        Shape: SerialNumber;
        Include: Prisma.SerialNumberInclude;
        Select: Prisma.SerialNumberSelect;
        OrderBy: Prisma.SerialNumberOrderByWithRelationInput;
        WhereUnique: Prisma.SerialNumberWhereUniqueInput;
        Where: Prisma.SerialNumberWhereInput;
        Create: {};
        Update: {};
        RelationName: "config" | "item" | "binStockItems" | "boxLines";
        ListRelations: "binStockItems" | "boxLines";
        Relations: {
            config: {
                Shape: SerialNumberConfig;
                Name: "SerialNumberConfig";
                Nullable: false;
            };
            item: {
                Shape: Item | null;
                Name: "Item";
                Nullable: true;
            };
            binStockItems: {
                Shape: BinStockItem[];
                Name: "BinStockItem";
                Nullable: false;
            };
            boxLines: {
                Shape: BoxLine[];
                Name: "BoxLine";
                Nullable: false;
            };
        };
    };
    Box: {
        Name: "Box";
        Shape: Box;
        Include: Prisma.BoxInclude;
        Select: Prisma.BoxSelect;
        OrderBy: Prisma.BoxOrderByWithRelationInput;
        WhereUnique: Prisma.BoxWhereUniqueInput;
        Where: Prisma.BoxWhereInput;
        Create: {};
        Update: {};
        RelationName: "bin" | "warehouse" | "lines";
        ListRelations: "lines";
        Relations: {
            bin: {
                Shape: Bin | null;
                Name: "Bin";
                Nullable: true;
            };
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
            lines: {
                Shape: BoxLine[];
                Name: "BoxLine";
                Nullable: false;
            };
        };
    };
    BoxLine: {
        Name: "BoxLine";
        Shape: BoxLine;
        Include: Prisma.BoxLineInclude;
        Select: Prisma.BoxLineSelect;
        OrderBy: Prisma.BoxLineOrderByWithRelationInput;
        WhereUnique: Prisma.BoxLineWhereUniqueInput;
        Where: Prisma.BoxLineWhereInput;
        Create: {};
        Update: {};
        RelationName: "box" | "item" | "lot" | "serialNumber" | "unitOfMeasure";
        ListRelations: never;
        Relations: {
            box: {
                Shape: Box;
                Name: "Box";
                Nullable: false;
            };
            item: {
                Shape: BinStockItem;
                Name: "BinStockItem";
                Nullable: false;
            };
            lot: {
                Shape: Lot | null;
                Name: "Lot";
                Nullable: true;
            };
            serialNumber: {
                Shape: SerialNumber | null;
                Name: "SerialNumber";
                Nullable: true;
            };
            unitOfMeasure: {
                Shape: UnitOfMeasure;
                Name: "UnitOfMeasure";
                Nullable: false;
            };
        };
    };
    Notification: {
        Name: "Notification";
        Shape: Notification;
        Include: Prisma.NotificationInclude;
        Select: Prisma.NotificationSelect;
        OrderBy: Prisma.NotificationOrderByWithRelationInput;
        WhereUnique: Prisma.NotificationWhereUniqueInput;
        Where: Prisma.NotificationWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    Error: {
        Name: "Error";
        Shape: Error;
        Include: never;
        Select: Prisma.ErrorSelect;
        OrderBy: Prisma.ErrorOrderByWithRelationInput;
        WhereUnique: Prisma.ErrorWhereUniqueInput;
        Where: Prisma.ErrorWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    AlertRule: {
        Name: "AlertRule";
        Shape: AlertRule;
        Include: Prisma.AlertRuleInclude;
        Select: Prisma.AlertRuleSelect;
        OrderBy: Prisma.AlertRuleOrderByWithRelationInput;
        WhereUnique: Prisma.AlertRuleWhereUniqueInput;
        Where: Prisma.AlertRuleWhereInput;
        Create: {};
        Update: {};
        RelationName: "warehouse";
        ListRelations: never;
        Relations: {
            warehouse: {
                Shape: Warehouse;
                Name: "Warehouse";
                Nullable: false;
            };
        };
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"UnitOfMeasure\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"decimalRound\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Item\",\"kind\":\"object\",\"name\":\"items\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"binStockItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BoxLine\",\"kind\":\"object\",\"name\":\"boxLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxLineToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderLine\",\"kind\":\"object\",\"name\":\"purchaseOrderLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderLineToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"SalesOrderLine\",\"kind\":\"object\",\"name\":\"salesOrderLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SalesOrderLineToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TransferOrderLine\",\"kind\":\"object\",\"name\":\"transferOrderLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferOrderLineToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReturnOrderLine\",\"kind\":\"object\",\"name\":\"returnOrderLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReturnOrderLineToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AdjustmentOrderLine\",\"kind\":\"object\",\"name\":\"adjustmentOrderLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AdjustmentOrderLineToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinOperationEntry\",\"kind\":\"object\",\"name\":\"binOperationEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ItemLedgerEntry\",\"kind\":\"object\",\"name\":\"itemLedgerEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemLedgerEntryToUnitOfMeasure\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ItemCategory\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"iconUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"hasChildren\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"parentCode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"handlingFlags\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ItemCategory\",\"kind\":\"object\",\"name\":\"parent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemCategoryChildren\",\"relationFromFields\":[\"parentCode\"],\"isUpdatedAt\":false},{\"type\":\"ItemCategory\",\"kind\":\"object\",\"name\":\"children\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemCategoryChildren\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Item\",\"kind\":\"object\",\"name\":\"items\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemInCategory\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Item\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sku\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"barcode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"categoryId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ItemTrackingMode\",\"kind\":\"enum\",\"name\":\"trackingMode\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"weightKg\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"dimensions\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"minQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"supplierId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ItemCategory\",\"kind\":\"object\",\"name\":\"category\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemInCategory\",\"relationFromFields\":[\"categoryId\"],\"isUpdatedAt\":false},{\"type\":\"BusinessParty\",\"kind\":\"object\",\"name\":\"supplier\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SupplierItems\",\"relationFromFields\":[\"supplierId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"binStockItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToItem\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Lot\",\"kind\":\"object\",\"name\":\"lots\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemToLot\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"SerialNumber\",\"kind\":\"object\",\"name\":\"serialNumbers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemToSerialNumber\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"SerialNumberConfig\",\"kind\":\"object\",\"name\":\"serialNumberConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemToSerialNumberConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"SerialNumberConfig\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"SerialEntityType\",\"kind\":\"enum\",\"name\":\"entityType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"prefix\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"format\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"lastValue\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"incrementBy\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SerialMode\",\"kind\":\"enum\",\"name\":\"mode\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Item\",\"kind\":\"object\",\"name\":\"item\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemToSerialNumberConfig\",\"relationFromFields\":[\"itemId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SerialNumberConfigToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"SerialNumber\",\"kind\":\"object\",\"name\":\"serials\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SerialNumberToSerialNumberConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"User\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"passwordHash\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"badgeNumber\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"pinHash\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"firstName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fullName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"enum\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"profilePictureUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"LoginType\",\"kind\":\"enum\",\"name\":\"loginType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastLoginDeviceId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isLoggedIn\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"lastLoginDevice\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserLastDevice\",\"relationFromFields\":[\"lastLoginDeviceId\"],\"isUpdatedAt\":false},{\"type\":\"RefreshToken\",\"kind\":\"object\",\"name\":\"refreshTokens\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RefreshTokenToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DeviceSession\",\"kind\":\"object\",\"name\":\"deviceSessions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSessionToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WarehouseAssignment\",\"kind\":\"object\",\"name\":\"warehouseAssignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToWarehouseAssignment\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UserActivityEntry\",\"kind\":\"object\",\"name\":\"userActivityEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToUserActivityEntry\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinOperationEntry\",\"kind\":\"object\",\"name\":\"binOperationEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Notification\",\"kind\":\"object\",\"name\":\"notifications\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NotificationToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderAssignment\",\"kind\":\"object\",\"name\":\"orderAssignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderAssignmentToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"usedByDevices\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceLastUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"activeTrolleys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyCurrentUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"createdWarehouses\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WarehouseCreatedBy\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderExecutionActivity\",\"kind\":\"object\",\"name\":\"orderExecutionActivities\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderExecutionActivityToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Device\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"authorized\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DeviceAuthorizationStatus\",\"kind\":\"enum\",\"name\":\"authorizationStatus\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DeviceType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DeviceSubType\",\"kind\":\"enum\",\"name\":\"subType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DeviceOnlineStatus\",\"kind\":\"enum\",\"name\":\"onlineStatus\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DeviceSyncStatus\",\"kind\":\"enum\",\"name\":\"syncStatus\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"registeredAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastSeenAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastHeartbeatAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastErrorAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"errorCount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"LoginMode\",\"kind\":\"enum\",\"name\":\"loginMode\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastUserId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"lastUser\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceLastUser\",\"relationFromFields\":[\"lastUserId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"loggedInByUsers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserLastDevice\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"RefreshToken\",\"kind\":\"object\",\"name\":\"refreshTokens\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToRefreshToken\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DeviceSession\",\"kind\":\"object\",\"name\":\"deviceSessions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToDeviceSession\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DeviceSyncEvent\",\"kind\":\"object\",\"name\":\"syncEvents\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToDeviceSyncEvent\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"trolley\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyDevice\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UserActivityEntry\",\"kind\":\"object\",\"name\":\"userActivityEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceActivityEntries\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinOperationEntry\",\"kind\":\"object\",\"name\":\"binOperationEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceBinOperations\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderAssignment\",\"kind\":\"object\",\"name\":\"orderAssignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceOrderAssignments\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderExecutionActivity\",\"kind\":\"object\",\"name\":\"orderExecutionActivities\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceExecutionActivities\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"transitBinStockItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransitBinStockItems\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"RefreshToken\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tokenHash\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceLabel\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceSessionId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expiresAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"revokedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RefreshTokenToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"device\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToRefreshToken\",\"relationFromFields\":[\"deviceId\"],\"isUpdatedAt\":false},{\"type\":\"DeviceSession\",\"kind\":\"object\",\"name\":\"deviceSession\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSessionToRefreshToken\",\"relationFromFields\":[\"deviceSessionId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"DeviceSession\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DeviceSessionStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"loginAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastActiveAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"logoutAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"endedReason\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"metadata\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSessionToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"device\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToDeviceSession\",\"relationFromFields\":[\"deviceId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSessionToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSessionToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false},{\"type\":\"RefreshToken\",\"kind\":\"object\",\"name\":\"refreshTokens\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSessionToRefreshToken\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Trolley\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"currentDeviceId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"currentUserId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastSeenAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"currentDevice\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyDevice\",\"relationFromFields\":[\"currentDeviceId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"currentUser\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyCurrentUser\",\"relationFromFields\":[\"currentUserId\"],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"transitBinStockItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransitTrolleyStockItems\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UserActivityEntry\",\"kind\":\"object\",\"name\":\"userActivityEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyActivityEntries\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinOperationEntry\",\"kind\":\"object\",\"name\":\"binOperationEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyBinOperations\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderAssignment\",\"kind\":\"object\",\"name\":\"orderAssignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyOrderAssignments\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderExecutionActivity\",\"kind\":\"object\",\"name\":\"orderExecutionActivities\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyExecutionActivities\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DeviceSyncEvent\",\"kind\":\"object\",\"name\":\"syncEvents\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSyncEventToTrolley\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"DeviceSyncEvent\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"trolleyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"eventType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SyncEventStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"payload\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"errorMessage\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"retryCount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"syncedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"device\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToDeviceSyncEvent\",\"relationFromFields\":[\"deviceId\"],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"trolley\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSyncEventToTrolley\",\"relationFromFields\":[\"trolleyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"WarehouseAssignment\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToWarehouseAssignment\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WarehouseToWarehouseAssignment\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WarehouseAssignmentToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"warehouseId\",\"zoneId\"]}]},\"Warehouse\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"address\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"timezone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"currency\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"WarehouseStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdById\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"createdBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WarehouseCreatedBy\",\"relationFromFields\":[\"createdById\"],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zones\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WarehouseToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Bin\",\"kind\":\"object\",\"name\":\"bins\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WarehouseAssignment\",\"kind\":\"object\",\"name\":\"assignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WarehouseToWarehouseAssignment\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"devices\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DeviceSession\",\"kind\":\"object\",\"name\":\"deviceSessions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSessionToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"trolleys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrder\",\"kind\":\"object\",\"name\":\"purchaseOrders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderReceipt\",\"kind\":\"object\",\"name\":\"purchaseOrderReceipts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderReceiptToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"SalesOrder\",\"kind\":\"object\",\"name\":\"salesOrders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SalesOrderToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TransferOrder\",\"kind\":\"object\",\"name\":\"transferOrders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferOrderToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReturnOrder\",\"kind\":\"object\",\"name\":\"returnOrders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReturnOrderToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AdjustmentOrder\",\"kind\":\"object\",\"name\":\"adjustOrders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AdjustmentOrderToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinOperationEntry\",\"kind\":\"object\",\"name\":\"binOperationEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ItemLedgerEntry\",\"kind\":\"object\",\"name\":\"itemLedger\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemLedgerEntryToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UserActivityEntry\",\"kind\":\"object\",\"name\":\"uaeEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserActivityEntryToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderAssignment\",\"kind\":\"object\",\"name\":\"orderAssignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderAssignmentToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderExecutionActivity\",\"kind\":\"object\",\"name\":\"orderExecutionActivities\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderExecutionActivityToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AlertRule\",\"kind\":\"object\",\"name\":\"alertRules\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AlertRuleToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"SerialNumberConfig\",\"kind\":\"object\",\"name\":\"serialConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SerialNumberConfigToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Box\",\"kind\":\"object\",\"name\":\"boxes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxToWarehouse\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Zone\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ZoneType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"customPermissions\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"defaultReceivingBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"defaultQuarantineBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"defaultOutgoingBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WarehouseToZone\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"OrderExecutionActivity\",\"kind\":\"object\",\"name\":\"zoneExecutionActivities\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderExecutionActivityToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UserActivityEntry\",\"kind\":\"object\",\"name\":\"userActivityEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserActivityEntryToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinOperationEntry\",\"kind\":\"object\",\"name\":\"binOperationEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ItemLedgerEntry\",\"kind\":\"object\",\"name\":\"itemLedgerEntries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemLedgerEntryToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrderAssignment\",\"kind\":\"object\",\"name\":\"orderAssignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderAssignmentToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Bin\",\"kind\":\"object\",\"name\":\"bins\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WarehouseAssignment\",\"kind\":\"object\",\"name\":\"assignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WarehouseAssignmentToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DeviceSession\",\"kind\":\"object\",\"name\":\"deviceSessions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceSessionToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"devices\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceToZone\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"warehouseId\",\"name\"]}]},\"Bin\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BinType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isBlocked\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"blockReason\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"maxWeightKg\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"maxVolumeM3\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"maxCapacity\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"currentCapacity\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"binStockItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToBinStockItem\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Box\",\"kind\":\"object\",\"name\":\"boxes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToBox\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinHistory\",\"kind\":\"object\",\"name\":\"binHistory\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToBinHistory\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TransferOrder\",\"kind\":\"object\",\"name\":\"toTransfers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferToBin\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TransferOrder\",\"kind\":\"object\",\"name\":\"fromTransfers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferFromBin\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UserActivityEntry\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"actionType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"entityType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"entityId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"metadata\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"trolleyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderType\",\"kind\":\"enum\",\"name\":\"orderType\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ipAddress\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderAssignmentId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserToUserActivityEntry\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserActivityEntryToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserActivityEntryToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"device\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceActivityEntries\",\"relationFromFields\":[\"deviceId\"],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"trolley\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyActivityEntries\",\"relationFromFields\":[\"trolleyId\"],\"isUpdatedAt\":false},{\"type\":\"BinOperationEntry\",\"kind\":\"object\",\"name\":\"boes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToUserActivityEntry\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"BinOperationEntry\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"trolleyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BinOperationType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fromBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"toBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warItemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serialNumberId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderType\",\"kind\":\"enum\",\"name\":\"orderType\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"affectsFiscalStock\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"boxId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reasonCode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reversedByEntryId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reversesEntryId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userActivityEntryId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"device\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceBinOperations\",\"relationFromFields\":[\"deviceId\"],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"trolley\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyBinOperations\",\"relationFromFields\":[\"trolleyId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false},{\"type\":\"UserActivityEntry\",\"kind\":\"object\",\"name\":\"userActivityEntry\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToUserActivityEntry\",\"relationFromFields\":[\"userActivityEntryId\"],\"isUpdatedAt\":false},{\"type\":\"ItemLedgerEntry\",\"kind\":\"object\",\"name\":\"itemLedgers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToItemLedgerEntry\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ItemLedgerEntry\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warItemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"FiscalInventoryEventType\",\"kind\":\"enum\",\"name\":\"eventType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantityDelta\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serialNumberId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderType\",\"kind\":\"enum\",\"name\":\"orderType\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"boeId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reference\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"externalDocumentRef\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"performedByUserId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reasonCode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BinOperationEntry\",\"kind\":\"object\",\"name\":\"boe\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinOperationEntryToItemLedgerEntry\",\"relationFromFields\":[\"boeId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemLedgerEntryToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemLedgerEntryToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemLedgerEntryToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"OrderAssignment\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderType\",\"kind\":\"enum\",\"name\":\"orderType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AssignmentLifecycle\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"trolleyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"assignedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"pausedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"releasedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"completedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"cancelledAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"timedOutAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderAssignmentToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderAssignmentToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"OrderExecutionActivity\",\"kind\":\"object\",\"name\":\"activities\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ActivitiesPerformedInSession\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderAssignmentToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"device\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceOrderAssignments\",\"relationFromFields\":[\"deviceId\"],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"trolley\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyOrderAssignments\",\"relationFromFields\":[\"trolleyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"orderType\",\"orderId\",\"userId\"]}]},\"OrderExecutionActivity\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderAssignmentId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zoneId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deviceId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"trolleyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ExecutionActivity\",\"kind\":\"enum\",\"name\":\"activityType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderType\",\"kind\":\"enum\",\"name\":\"orderType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderLineRefId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderAssignment\",\"kind\":\"object\",\"name\":\"orderAssignment\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ActivitiesPerformedInSession\",\"relationFromFields\":[\"orderAssignmentId\"],\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderExecutionActivityToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderExecutionActivityToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Zone\",\"kind\":\"object\",\"name\":\"zone\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrderExecutionActivityToZone\",\"relationFromFields\":[\"zoneId\"],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"device\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DeviceExecutionActivities\",\"relationFromFields\":[\"deviceId\"],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"trolley\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TrolleyExecutionActivities\",\"relationFromFields\":[\"trolleyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"BinHistory\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"binId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"date\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantityOnHand\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantityBlocked\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantityReserved\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Bin\",\"kind\":\"object\",\"name\":\"bin\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToBinHistory\",\"relationFromFields\":[\"binId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"binId\",\"date\"]}]},\"PurchaseOrder\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reference\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderPriority\",\"kind\":\"enum\",\"name\":\"priority\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"businessPartyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"supplierNameSnapshot\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdById\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"confirmedById\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"confirmedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expectedDeliveryDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"actualDeliveryDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"executionStartedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"executionCompletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"totalReceivedQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"totalOpenQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"completedLines\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"openLines\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"totalLines\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"BusinessParty\",\"kind\":\"object\",\"name\":\"businessParty\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SupplierPurchaseOrders\",\"relationFromFields\":[\"businessPartyId\"],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderLine\",\"kind\":\"object\",\"name\":\"lines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderToPurchaseOrderLine\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderReceipt\",\"kind\":\"object\",\"name\":\"receipts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderToPurchaseOrderReceipt\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"PurchaseOrderReceipt\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reference\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"purchaseOrderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReceiptStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"supplierNameSnapshot\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"receivingSequence\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdById\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"startedById\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"completedById\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"completedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"totalProcessedQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"totalAcceptedQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"totalRejectedQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"totalQuarantinedQty\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"PurchaseOrder\",\"kind\":\"object\",\"name\":\"purchaseOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderToPurchaseOrderReceipt\",\"relationFromFields\":[\"purchaseOrderId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderReceiptToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderReceiptLine\",\"kind\":\"object\",\"name\":\"lines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderReceiptToPurchaseOrderReceiptLine\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"PurchaseOrderLine\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"purchaseOrderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"lineSequence\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemNameSnapshot\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"orderedQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"PurchaseOrder\",\"kind\":\"object\",\"name\":\"purchaseOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderToPurchaseOrderLine\",\"relationFromFields\":[\"purchaseOrderId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderLineToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderReceiptLine\",\"kind\":\"object\",\"name\":\"receiptLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderLineToPurchaseOrderReceiptLine\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"purchaseOrderId\",\"lineSequence\"]}]},\"PurchaseOrderReceiptLine\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"purchaseOrderReceiptId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"purchaseOrderLineId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"orderedQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemNameSnapshot\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReceiptOutcome\",\"kind\":\"enum\",\"name\":\"disposition\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"orderExecutionActivityId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"correctionOfLineId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderReceipt\",\"kind\":\"object\",\"name\":\"receiptLine\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderReceiptToPurchaseOrderReceiptLine\",\"relationFromFields\":[\"purchaseOrderReceiptId\"],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderLine\",\"kind\":\"object\",\"name\":\"purchaseOrderLine\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PurchaseOrderLineToPurchaseOrderReceiptLine\",\"relationFromFields\":[\"purchaseOrderLineId\"],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderReceiptLine\",\"kind\":\"object\",\"name\":\"correctedLine\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReceiptLineCorrections\",\"relationFromFields\":[\"correctionOfLineId\"],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderReceiptLine\",\"kind\":\"object\",\"name\":\"correctionLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReceiptLineCorrections\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"stockItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemPurchaseOrderReceiptLines\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"SalesOrder\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reference\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderPriority\",\"kind\":\"enum\",\"name\":\"priority\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"businessPartyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"customerName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"deliveryAddress\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"carrierId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdById\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"confirmedById\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SalesOrderToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"BusinessParty\",\"kind\":\"object\",\"name\":\"businessParty\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CustomerSalesOrders\",\"relationFromFields\":[\"businessPartyId\"],\"isUpdatedAt\":false},{\"type\":\"SalesOrderLine\",\"kind\":\"object\",\"name\":\"lines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SalesOrderToSalesOrderLine\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"SalesOrderLine\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"salesOrderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemNameSnapshot\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"destinationBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"originBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"baseQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"handledQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isShort\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serialNumberId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SalesOrder\",\"kind\":\"object\",\"name\":\"salesOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SalesOrderToSalesOrderLine\",\"relationFromFields\":[\"salesOrderId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SalesOrderLineToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"TransferOrder\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reference\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderPriority\",\"kind\":\"enum\",\"name\":\"priority\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"originBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"destinationBinId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isCrossWarehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdById\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"confirmedById\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferOrderToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"Bin\",\"kind\":\"object\",\"name\":\"originBin\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferFromBin\",\"relationFromFields\":[\"originBinId\"],\"isUpdatedAt\":false},{\"type\":\"Bin\",\"kind\":\"object\",\"name\":\"destinationBin\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferToBin\",\"relationFromFields\":[\"destinationBinId\"],\"isUpdatedAt\":false},{\"type\":\"TransferOrderLine\",\"kind\":\"object\",\"name\":\"lines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferOrderToTransferOrderLine\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"TransferOrderLine\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"transferOrderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemNameSnapshot\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"binId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"baseQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"handledQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isShort\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serialNumberId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TransferOrder\",\"kind\":\"object\",\"name\":\"transferOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferOrderToTransferOrderLine\",\"relationFromFields\":[\"transferOrderId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransferOrderLineToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ReturnOrder\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reference\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderPriority\",\"kind\":\"enum\",\"name\":\"priority\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"originSalesOrderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"returnDisposition\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdById\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"confirmedById\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReturnOrderToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"ReturnOrderLine\",\"kind\":\"object\",\"name\":\"lines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReturnOrderToReturnOrderLine\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ReturnOrderLine\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"returnOrderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemNameSnapshot\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"binId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"baseQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"handledQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isShort\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serialNumberId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReturnOrder\",\"kind\":\"object\",\"name\":\"returnOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReturnOrderToReturnOrderLine\",\"relationFromFields\":[\"returnOrderId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReturnOrderLineToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AdjustmentOrder\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reference\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrderPriority\",\"kind\":\"enum\",\"name\":\"priority\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reasonCode\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdById\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"confirmedById\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AdjustmentOrderToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"AdjustmentOrderLine\",\"kind\":\"object\",\"name\":\"lines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AdjustmentOrderToAdjustmentOrderLine\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AdjustmentOrderLine\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"adjustmentOrderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"sequence\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemNameSnapshot\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"binId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"baseQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"handledQuantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isShort\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serialNumberId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AdjustmentOrder\",\"kind\":\"object\",\"name\":\"adjustmentOrder\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AdjustmentOrderToAdjustmentOrderLine\",\"relationFromFields\":[\"adjustmentOrderId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AdjustmentOrderLineToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"adjustmentOrderId\",\"sequence\"]},\"uniqueIndexes\":[]},\"BusinessParty\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BusinessPartyType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"legalName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"phone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"website\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"vatNumber\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"taxId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"ContactPerson\",\"kind\":\"object\",\"name\":\"addresses\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BusinessPartyToContactPerson\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Address\",\"kind\":\"object\",\"name\":\"contacts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AddressToBusinessParty\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Item\",\"kind\":\"object\",\"name\":\"supplierItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SupplierItems\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PurchaseOrder\",\"kind\":\"object\",\"name\":\"purchaseOrders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SupplierPurchaseOrders\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"SalesOrder\",\"kind\":\"object\",\"name\":\"salesOrders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CustomerSalesOrders\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ContactPerson\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"businessPartyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"firstName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fullName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"roleTitle\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"phone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"mobile\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isPrimary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"BusinessParty\",\"kind\":\"object\",\"name\":\"businessParty\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BusinessPartyToContactPerson\",\"relationFromFields\":[\"businessPartyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Address\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"businessPartyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"AddressType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"label\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"streetLine1\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"streetLine2\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"city\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"state\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"postalCode\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"country\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isPrimary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"BusinessParty\",\"kind\":\"object\",\"name\":\"businessParty\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AddressToBusinessParty\",\"relationFromFields\":[\"businessPartyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"BinStockItem\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"binId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serialNumberId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantityAvailable\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantityReserved\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantityBlocked\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BinItemStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"transitDeviceId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"transitTrolleyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expiryDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sku\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reservedByOrderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"reservedByOrderLineId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"createdByBoeId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastOperationBoeId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"boxId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"PurchaseOrderReceiptLine\",\"kind\":\"object\",\"name\":\"purchaseOrderReceiptLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemPurchaseOrderReceiptLines\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Bin\",\"kind\":\"object\",\"name\":\"bin\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToBinStockItem\",\"relationFromFields\":[\"binId\"],\"isUpdatedAt\":false},{\"type\":\"Item\",\"kind\":\"object\",\"name\":\"item\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToItem\",\"relationFromFields\":[\"itemId\"],\"isUpdatedAt\":false},{\"type\":\"Lot\",\"kind\":\"object\",\"name\":\"lot\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToLot\",\"relationFromFields\":[\"lotId\"],\"isUpdatedAt\":false},{\"type\":\"SerialNumber\",\"kind\":\"object\",\"name\":\"serialNumber\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToSerialNumber\",\"relationFromFields\":[\"serialNumberId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false},{\"type\":\"Device\",\"kind\":\"object\",\"name\":\"transitDevice\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransitBinStockItems\",\"relationFromFields\":[\"transitDeviceId\"],\"isUpdatedAt\":false},{\"type\":\"Trolley\",\"kind\":\"object\",\"name\":\"transitTrolley\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TransitTrolleyStockItems\",\"relationFromFields\":[\"transitTrolleyId\"],\"isUpdatedAt\":false},{\"type\":\"BoxLine\",\"kind\":\"object\",\"name\":\"boxLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToBoxLine\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"binId\",\"itemId\",\"lotId\",\"serialNumberId\",\"status\",\"transitDeviceId\",\"transitTrolleyId\"]}]},\"Lot\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotNumber\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"purchaseOrderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"receivedDate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expiryDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"LotStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Item\",\"kind\":\"object\",\"name\":\"item\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemToLot\",\"relationFromFields\":[\"itemId\"],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"binStockItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToLot\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BoxLine\",\"kind\":\"object\",\"name\":\"boxLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxLineToLot\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"SerialNumber\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serial\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"configId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SerialEntityType\",\"kind\":\"enum\",\"name\":\"entityType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"baseValue\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"partialCurrent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"partialTotal\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SerialStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"SerialNumberConfig\",\"kind\":\"object\",\"name\":\"config\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SerialNumberToSerialNumberConfig\",\"relationFromFields\":[\"configId\"],\"isUpdatedAt\":false},{\"type\":\"Item\",\"kind\":\"object\",\"name\":\"item\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ItemToSerialNumber\",\"relationFromFields\":[\"itemId\"],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"binStockItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToSerialNumber\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BoxLine\",\"kind\":\"object\",\"name\":\"boxLines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxLineToSerialNumber\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Box\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BoxStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"binId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"weightKg\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Bin\",\"kind\":\"object\",\"name\":\"bin\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinToBox\",\"relationFromFields\":[\"binId\"],\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false},{\"type\":\"BoxLine\",\"kind\":\"object\",\"name\":\"lines\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxToBoxLine\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"BoxLine\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"boxId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"itemId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Decimal\",\"kind\":\"scalar\",\"name\":\"quantity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lotId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"serialNumberId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uom\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Box\",\"kind\":\"object\",\"name\":\"box\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxToBoxLine\",\"relationFromFields\":[\"boxId\"],\"isUpdatedAt\":false},{\"type\":\"BinStockItem\",\"kind\":\"object\",\"name\":\"item\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BinStockItemToBoxLine\",\"relationFromFields\":[\"itemId\"],\"isUpdatedAt\":false},{\"type\":\"Lot\",\"kind\":\"object\",\"name\":\"lot\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxLineToLot\",\"relationFromFields\":[\"lotId\"],\"isUpdatedAt\":false},{\"type\":\"SerialNumber\",\"kind\":\"object\",\"name\":\"serialNumber\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxLineToSerialNumber\",\"relationFromFields\":[\"serialNumberId\"],\"isUpdatedAt\":false},{\"type\":\"UnitOfMeasure\",\"kind\":\"object\",\"name\":\"unitOfMeasure\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BoxLineToUnitOfMeasure\",\"relationFromFields\":[\"uom\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Notification\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"entityType\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"entityId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isRead\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NotificationToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Error\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"message\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"stack\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ErrorType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"errorCode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AlertRule\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"AlertRuleType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warehouseId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"warItemId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"threshold\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"enum\",\"name\":\"recipientRole\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Warehouse\",\"kind\":\"object\",\"name\":\"warehouse\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AlertRuleToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]}}}}"); }