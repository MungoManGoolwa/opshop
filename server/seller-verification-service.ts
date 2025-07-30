import { db } from "./db";
import { 
  verificationDocuments, 
  verificationSubmissions, 
  verificationAuditLog, 
  users,
  type VerificationDocument,
  type VerificationSubmission,
  type InsertVerificationDocument,
  type InsertVerificationSubmission,
  type InsertVerificationAuditLog
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface DocumentTypeConfig {
  type: string;
  points: number;
  category: 'photo_id' | 'supporting';
  displayName: string;
  description: string;
  requiresExpiry?: boolean;
  requiresBack?: boolean;
}

// Australian 100 Points of ID Document Types
export const DOCUMENT_TYPES: Record<string, DocumentTypeConfig> = {
  // Photo ID Documents (Primary - mandatory)
  passport: {
    type: 'passport',
    points: 70,
    category: 'photo_id',
    displayName: 'Australian Passport',
    description: 'Current Australian passport',
    requiresExpiry: true,
    requiresBack: false,
  },
  drivers_licence: {
    type: 'drivers_licence',
    points: 40,
    category: 'photo_id',
    displayName: "Driver's Licence",
    description: 'Current Australian driver\'s licence',
    requiresExpiry: true,
    requiresBack: true,
  },
  
  // Supporting Documents
  birth_certificate: {
    type: 'birth_certificate',
    points: 70,
    category: 'supporting',
    displayName: 'Birth Certificate',
    description: 'Australian birth certificate',
    requiresExpiry: false,
    requiresBack: false,
  },
  citizenship_certificate: {
    type: 'citizenship_certificate',
    points: 70,
    category: 'supporting',
    displayName: 'Citizenship Certificate',
    description: 'Australian citizenship certificate',
    requiresExpiry: false,
    requiresBack: false,
  },
  medicare_card: {
    type: 'medicare_card',
    points: 25,
    category: 'supporting',
    displayName: 'Medicare Card',
    description: 'Current Medicare card',
    requiresExpiry: true,
    requiresBack: false,
  },
  bank_statement: {
    type: 'bank_statement',
    points: 25,
    category: 'supporting',
    displayName: 'Bank Statement',
    description: 'Bank statement (last 3 months)',
    requiresExpiry: false,
    requiresBack: false,
  },
  utility_bill: {
    type: 'utility_bill',
    points: 25,
    category: 'supporting',
    displayName: 'Utility Bill',
    description: 'Utility bill (last 3 months)',
    requiresExpiry: false,
    requiresBack: false,
  },
  tax_notice: {
    type: 'tax_notice',
    points: 25,
    category: 'supporting',
    displayName: 'Tax Assessment Notice',
    description: 'Australian tax assessment notice',
    requiresExpiry: false,
    requiresBack: false,
  },
  centrelink_card: {
    type: 'centrelink_card',
    points: 25,
    category: 'supporting',
    displayName: 'Centrelink Card',
    description: 'Current Centrelink pension/health care card',
    requiresExpiry: true,
    requiresBack: false,
  },
};

export class SellerVerificationService {
  
  // Get user's current verification status
  async getVerificationStatus(userId: string) {
    try {
      const [submission] = await db
        .select()
        .from(verificationSubmissions)
        .where(eq(verificationSubmissions.userId, userId))
        .orderBy(desc(verificationSubmissions.createdAt))
        .limit(1);

      const documents = await db
        .select()
        .from(verificationDocuments)
        .where(eq(verificationDocuments.userId, userId))
        .orderBy(desc(verificationDocuments.createdAt));

      return {
        submission,
        documents,
        totalPoints: submission?.totalPoints || 0,
        hasPhotoId: submission?.hasPhotoId || false,
        isEligible: this.isEligibleForVerification(submission, documents),
      };
    } catch (error) {
      console.error("Error getting verification status:", error);
      throw error;
    }
  }

  // Check if user meets verification requirements
  private isEligibleForVerification(
    submission: VerificationSubmission | undefined, 
    documents: VerificationDocument[]
  ): boolean {
    if (!submission) return false;
    
    const totalPoints = submission.totalPoints || 0;
    const hasPhotoId = submission.hasPhotoId || false;
    
    return totalPoints >= 100 && hasPhotoId;
  }

  // Upload verification document
  async uploadDocument(userId: string, documentData: InsertVerificationDocument) {
    try {
      const documentConfig = DOCUMENT_TYPES[documentData.documentType];
      if (!documentConfig) {
        throw new Error("Invalid document type");
      }

      // Check if user already has this document type
      const existingDoc = await db
        .select()
        .from(verificationDocuments)
        .where(and(
          eq(verificationDocuments.userId, userId),
          eq(verificationDocuments.documentType, documentData.documentType)
        ))
        .limit(1);

      if (existingDoc.length > 0) {
        throw new Error("Document type already uploaded");
      }

      // Create document record
      const [document] = await db
        .insert(verificationDocuments)
        .values({
          ...documentData,
          userId,
          documentPoints: documentConfig.points,
          verificationStatus: 'pending',
        })
        .returning();

      // Update or create submission
      await this.updateSubmissionProgress(userId);

      // Log the action
      await this.logAction(userId, {
        action: 'document_uploaded',
        documentId: document.id,
        details: { documentType: documentData.documentType, points: documentConfig.points },
      });

      return document;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  // Update submission progress
  private async updateSubmissionProgress(userId: string) {
    try {
      const documents = await db
        .select()
        .from(verificationDocuments)
        .where(eq(verificationDocuments.userId, userId));

      const totalPoints = documents
        .filter(doc => doc.verificationStatus === 'verified' || doc.verificationStatus === 'pending')
        .reduce((sum, doc) => sum + (doc.documentPoints || 0), 0);

      const hasPhotoId = documents.some(doc => 
        (doc.documentType === 'passport' || doc.documentType === 'drivers_licence') &&
        (doc.verificationStatus === 'verified' || doc.verificationStatus === 'pending')
      );

      // Get or create submission
      let [submission] = await db
        .select()
        .from(verificationSubmissions)
        .where(eq(verificationSubmissions.userId, userId))
        .orderBy(desc(verificationSubmissions.createdAt))
        .limit(1);

      if (!submission) {
        [submission] = await db
          .insert(verificationSubmissions)
          .values({
            userId,
            totalPoints,
            hasPhotoId,
            submissionStatus: 'draft',
          })
          .returning();
      } else {
        await db
          .update(verificationSubmissions)
          .set({ 
            totalPoints, 
            hasPhotoId,
            updatedAt: new Date(),
          })
          .where(eq(verificationSubmissions.id, submission.id));
      }

      return { totalPoints, hasPhotoId };
    } catch (error) {
      console.error("Error updating submission progress:", error);
      throw error;
    }
  }

  // Submit verification for admin review
  async submitForReview(userId: string) {
    try {
      const status = await this.getVerificationStatus(userId);
      
      if (!status.isEligible) {
        throw new Error("Not eligible for verification. Need 100 points and one photo ID.");
      }

      if (!status.submission) {
        throw new Error("No submission found");
      }

      await db
        .update(verificationSubmissions)
        .set({
          submissionStatus: 'submitted',
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(verificationSubmissions.id, status.submission.id));

      // Update user verification status
      await db
        .update(users)
        .set({
          verificationStatus: 'pending',
          verificationSubmittedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log the action
      await this.logAction(userId, {
        action: 'submission_submitted',
        submissionId: status.submission.id,
        details: { totalPoints: status.totalPoints, hasPhotoId: status.hasPhotoId },
      });

      return status.submission;
    } catch (error) {
      console.error("Error submitting for review:", error);
      throw error;
    }
  }

  // Admin: Verify document
  async verifyDocument(documentId: number, adminId: string, approved: boolean, rejectionReason?: string) {
    try {
      const [document] = await db
        .update(verificationDocuments)
        .set({
          verificationStatus: approved ? 'verified' : 'rejected',
          verifiedAt: new Date(),
          verifiedBy: adminId,
          rejectionReason: rejectionReason || null,
          updatedAt: new Date(),
        })
        .where(eq(verificationDocuments.id, documentId))
        .returning();

      if (!document) {
        throw new Error("Document not found");
      }

      // Update submission progress
      await this.updateSubmissionProgress(document.userId);

      // Log the action
      await this.logAction(document.userId, {
        action: approved ? 'document_verified' : 'document_rejected',
        adminId,
        documentId,
        details: { approved, rejectionReason },
      });

      return document;
    } catch (error) {
      console.error("Error verifying document:", error);
      throw error;
    }
  }

  // Admin: Approve/reject submission
  async reviewSubmission(submissionId: number, adminId: string, approved: boolean, reviewNotes?: string) {
    try {
      const [submission] = await db
        .update(verificationSubmissions)
        .set({
          submissionStatus: approved ? 'approved' : 'rejected',
          reviewedAt: new Date(),
          reviewedBy: adminId,
          reviewNotes: reviewNotes || null,
          approvalDate: approved ? new Date() : null,
          rejectionReason: approved ? null : reviewNotes,
          updatedAt: new Date(),
        })
        .where(eq(verificationSubmissions.id, submissionId))
        .returning();

      if (!submission) {
        throw new Error("Submission not found");
      }

      // Update user verification status
      await db
        .update(users)
        .set({
          verificationStatus: approved ? 'verified' : 'rejected',
          verificationCompletedAt: new Date(),
          isVerified: approved,
          updatedAt: new Date(),
        })
        .where(eq(users.id, submission.userId));

      // Log the action
      await this.logAction(submission.userId, {
        action: approved ? 'submission_approved' : 'submission_rejected',
        adminId,
        submissionId,
        details: { approved, reviewNotes },
      });

      return submission;
    } catch (error) {
      console.error("Error reviewing submission:", error);
      throw error;
    }
  }

  // Get pending submissions for admin review
  async getPendingSubmissions() {
    try {
      return await db
        .select({
          submission: verificationSubmissions,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(verificationSubmissions)
        .innerJoin(users, eq(verificationSubmissions.userId, users.id))
        .where(eq(verificationSubmissions.submissionStatus, 'submitted'))
        .orderBy(desc(verificationSubmissions.submittedAt));
    } catch (error) {
      console.error("Error getting pending submissions:", error);
      throw error;
    }
  }

  // Log verification action
  private async logAction(userId: string, logData: Partial<InsertVerificationAuditLog>) {
    try {
      await db.insert(verificationAuditLog).values({
        userId,
        action: logData.action || 'unknown_action',
        submissionId: logData.submissionId,
        documentId: logData.documentId,
        adminId: logData.adminId,
        ipAddress: '0.0.0.0', // Will be updated from request
        userAgent: 'System',
        details: logData.details,
      });
    } catch (error) {
      console.error("Error logging verification action:", error);
    }
  }

  // Get available document types for user
  getAvailableDocumentTypes(existingDocuments: VerificationDocument[] = []) {
    const existingTypes = existingDocuments.map(doc => doc.documentType);
    
    return Object.values(DOCUMENT_TYPES).filter(docType => 
      !existingTypes.includes(docType.type)
    );
  }

  // Calculate verification progress
  calculateProgress(documents: VerificationDocument[]) {
    const verifiedDocs = documents.filter(doc => doc.verificationStatus === 'verified');
    const totalPoints = verifiedDocs.reduce((sum, doc) => sum + (doc.documentPoints || 0), 0);
    const hasPhotoId = verifiedDocs.some(doc => 
      doc.documentType === 'passport' || doc.documentType === 'drivers_licence'
    );

    return {
      totalPoints,
      hasPhotoId,
      isComplete: totalPoints >= 100 && hasPhotoId,
      progress: Math.min((totalPoints / 100) * 100, 100),
    };
  }
}

export const verificationService = new SellerVerificationService();