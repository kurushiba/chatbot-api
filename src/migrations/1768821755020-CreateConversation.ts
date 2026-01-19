import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConversation1768821755020 implements MigrationInterface {
    name = 'CreateConversation1768821755020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conversation" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "title" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_conversation" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "title" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_c308b1cd542522bb66430fa860a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_conversation"("id", "userId", "title", "createdAt", "updatedAt") SELECT "id", "userId", "title", "createdAt", "updatedAt" FROM "conversation"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
        await queryRunner.query(`ALTER TABLE "temporary_conversation" RENAME TO "conversation"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" RENAME TO "temporary_conversation"`);
        await queryRunner.query(`CREATE TABLE "conversation" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "title" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "conversation"("id", "userId", "title", "createdAt", "updatedAt") SELECT "id", "userId", "title", "createdAt", "updatedAt" FROM "temporary_conversation"`);
        await queryRunner.query(`DROP TABLE "temporary_conversation"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
    }

}
