-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "resumeText" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "atsScore" INTEGER NOT NULL,
    "roleMatch" INTEGER NOT NULL,
    "missingKeywords" TEXT[],
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "suggestions" JSONB NOT NULL,
    "interviewChance" TEXT NOT NULL,
    "oneLinerFeedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resume_file_name" TEXT,
    "file_size" INTEGER,
    "processing_time" INTEGER,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "ip_address" TEXT,
    "status_code" INTEGER NOT NULL,
    "response_time" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analyses_created_at_idx" ON "analyses"("created_at" DESC);

-- CreateIndex
CREATE INDEX "analyses_targetRole_idx" ON "analyses"("targetRole");

-- CreateIndex
CREATE INDEX "analyses_atsScore_idx" ON "analyses"("atsScore");

-- CreateIndex
CREATE INDEX "api_usage_created_at_idx" ON "api_usage"("created_at" DESC);

-- CreateIndex
CREATE INDEX "api_usage_endpoint_idx" ON "api_usage"("endpoint");
