-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'LITE',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "pdfExportsUsed" INTEGER NOT NULL DEFAULT 0,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "websiteUrl" TEXT,
    "industry" TEXT,
    "geoTargets" TEXT,
    "employeeRange" TEXT,
    "revenueRange" TEXT,
    "offer" TEXT,
    "problem" TEXT,
    "pricingRange" TEXT,
    "salesCycleRange" TEXT,
    "toolsStack" TEXT,
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "company_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "onboarding_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "onboarding_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "icpJson" TEXT,
    "dmuJson" TEXT,
    "abmJson" TEXT,
    "outreachJson" TEXT,
    "lookalikeJson" TEXT,
    "icpConfidence" REAL NOT NULL DEFAULT 0,
    "dmuConfidence" REAL NOT NULL DEFAULT 0,
    "strictPassed" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "generated_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lead_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "leadCountMonthly" INTEGER NOT NULL,
    "pricePerLead" REAL NOT NULL,
    "totalPriceUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "deliverySlaBusinessDays" INTEGER NOT NULL DEFAULT 7,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lead_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lead_orders_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "generated_reports" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'PAYONEER',
    "invoiceLink" TEXT,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "amountUsd" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "lead_orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "export_packs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 50,
    "priceUsd" REAL NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "export_packs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "delivered_leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "contactId" TEXT,
    "fullName" TEXT,
    "roleTitle" TEXT,
    "linkedinUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "personalityType" TEXT,
    "personalityAnalysisUrl" TEXT,
    "companyId" TEXT,
    "brandName" TEXT,
    "notes" TEXT,
    "country" TEXT,
    "techStacks" TEXT,
    "seniorityLevel" TEXT,
    "buyingRole" TEXT,
    "preferredChannel" TEXT,
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT false,
    "whatsappAvailable" BOOLEAN NOT NULL DEFAULT false,
    "deliveryBatch" TEXT,
    "deliveryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Delivered',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "delivered_leads_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "lead_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_userId_key" ON "company_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_answers_userId_step_key_key" ON "onboarding_answers"("userId", "step", "key");
