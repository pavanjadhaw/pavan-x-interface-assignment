-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentActionType" AS ENUM ('CREATED', 'UPDATED', 'DELETED');

-- CreateEnum
CREATE TYPE "RevisionActionType" AS ENUM ('CREATED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "RevisionStatus" NOT NULL DEFAULT 'PENDING',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentActivity" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actionType" "DocumentActionType" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionActivity" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actionType" "RevisionActionType" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_id_key" ON "Profile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE INDEX "Profile_organizationId_idx" ON "Profile"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Document_organizationId_idx" ON "Document"("organizationId");

-- CreateIndex
CREATE INDEX "Revision_documentId_idx" ON "Revision"("documentId");

-- CreateIndex
CREATE INDEX "DocumentActivity_documentId_idx" ON "DocumentActivity"("documentId");

-- CreateIndex
CREATE INDEX "DocumentActivity_actorId_idx" ON "DocumentActivity"("actorId");

-- CreateIndex
CREATE INDEX "DocumentActivity_actionType_idx" ON "DocumentActivity"("actionType");

-- CreateIndex
CREATE INDEX "DocumentActivity_organizationId_idx" ON "DocumentActivity"("organizationId");

-- CreateIndex
CREATE INDEX "RevisionActivity_revisionId_idx" ON "RevisionActivity"("revisionId");

-- CreateIndex
CREATE INDEX "RevisionActivity_actorId_idx" ON "RevisionActivity"("actorId");

-- CreateIndex
CREATE INDEX "RevisionActivity_actionType_idx" ON "RevisionActivity"("actionType");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentActivity" ADD CONSTRAINT "DocumentActivity_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentActivity" ADD CONSTRAINT "DocumentActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentActivity" ADD CONSTRAINT "DocumentActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionActivity" ADD CONSTRAINT "RevisionActivity_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "Revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionActivity" ADD CONSTRAINT "RevisionActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
