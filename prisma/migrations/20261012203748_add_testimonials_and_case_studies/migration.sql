-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subCategory" TEXT,
    "description" TEXT,
    "techStack" TEXT,
    "liveUrl" TEXT,
    "githubUrl" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "blurDataUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'live',
    "views" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "problem" TEXT,
    "approach" TEXT,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkImage" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "blurDataUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroName" TEXT NOT NULL DEFAULT 'Fasinu David Omotayo',
    "heroRoles" TEXT NOT NULL DEFAULT 'Software Developer,Graphic Designer,Data Analyst',
    "heroTagline" TEXT NOT NULL DEFAULT 'I build, design, and make sense of things.',
    "heroSubtext" TEXT NOT NULL DEFAULT 'I write production software, design brand identities, and turn raw data into decisions worth acting on — all three, done properly.',
    "heroStatProjects" INTEGER NOT NULL DEFAULT 20,
    "heroStatYears" INTEGER NOT NULL DEFAULT 2,
    "heroStatClients" INTEGER NOT NULL DEFAULT 10,
    "cvUrl" TEXT,
    "logoUrl" TEXT,
    "heroPhotoUrl" TEXT,
    "heroPhotoBlurDataUrl" TEXT,
    "aboutHeadingLine1" TEXT NOT NULL DEFAULT 'The short version:',
    "aboutHeadingLine2" TEXT NOT NULL DEFAULT 'builder, designer, analyst.',
    "aboutParagraph1" TEXT NOT NULL DEFAULT 'I''m Fasinu David Omotayo — a software developer, graphic designer, and data analyst who likes working across all three rather than picking one.',
    "aboutParagraph2" TEXT NOT NULL DEFAULT 'Whichever hat I''m wearing, the approach is the same: understand the problem fully before touching code, a design tool, or a dataset.',
    "aboutImageUrl" TEXT,
    "aboutImageBlurDataUrl" TEXT,
    "aboutArtImageUrl" TEXT,
    "aboutArtImageBlurDataUrl" TEXT,
    "contactHeadingLine1" TEXT NOT NULL DEFAULT 'Let''s work',
    "contactHeadingLine2" TEXT NOT NULL DEFAULT 'together.',
    "contactSubtext" TEXT NOT NULL DEFAULT 'Open to software, design, and data projects. Fill out the form or reach out directly.',
    "contactEmail" TEXT NOT NULL DEFAULT 'hello@fasinudavid.com',
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "whatsappUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Work_status_type_idx" ON "Work"("status", "type");

-- CreateIndex
CREATE INDEX "Work_createdAt_idx" ON "Work"("createdAt");

-- CreateIndex
CREATE INDEX "WorkImage_workId_idx" ON "WorkImage"("workId");

-- CreateIndex
CREATE INDEX "Activity_type_createdAt_idx" ON "Activity"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkImage" ADD CONSTRAINT "WorkImage_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
