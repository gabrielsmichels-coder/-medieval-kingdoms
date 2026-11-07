CREATE TABLE "ActionReceipt" (
    "villageId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("villageId", "requestId"),
    CONSTRAINT "ActionReceipt_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
