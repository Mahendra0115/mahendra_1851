import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateArticlesAndBrandAuthors1763010000000 implements MigrationInterface {
  name = 'CreateArticlesAndBrandAuthors1763010000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
          ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'AUTHOR';
        END IF;
      END
      $$;
    `);

    const hasBrandAuthorsTable = await queryRunner.hasTable('brand_authors');
    if (!hasBrandAuthorsTable) {
      await queryRunner.createTable(
        new Table({
          name: 'brand_authors',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'brandId', type: 'integer' },
            { name: 'authorId', type: 'integer' },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
          uniques: [
            {
              name: 'UQ_brand_authors_brandId_authorId',
              columnNames: ['brandId', 'authorId'],
            },
          ],
        }),
      );
    }

    const hasArticlesTable = await queryRunner.hasTable('articles');
    if (!hasArticlesTable) {
      await queryRunner.createTable(
        new Table({
          name: 'articles',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'title', type: 'varchar' },
            { name: 'content', type: 'text' },
            { name: 'brandId', type: 'integer' },
            { name: 'authorId', type: 'integer' },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );
    }

    await queryRunner.createForeignKey(
      'brand_authors',
      new TableForeignKey({
        name: 'FK_brand_authors_brandId_brands_id',
        columnNames: ['brandId'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'brand_authors',
      new TableForeignKey({
        name: 'FK_brand_authors_authorId_users_id',
        columnNames: ['authorId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'articles',
      new TableForeignKey({
        name: 'FK_articles_brandId_brands_id',
        columnNames: ['brandId'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'articles',
      new TableForeignKey({
        name: 'FK_articles_authorId_users_id',
        columnNames: ['authorId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const articlesTable = await queryRunner.getTable('articles');
    const brandAuthorsTable = await queryRunner.getTable('brand_authors');

    const articleForeignKeys = articlesTable?.foreignKeys || [];
    for (const foreignKey of articleForeignKeys) {
      await queryRunner.dropForeignKey('articles', foreignKey);
    }

    const brandAuthorForeignKeys = brandAuthorsTable?.foreignKeys || [];
    for (const foreignKey of brandAuthorForeignKeys) {
      await queryRunner.dropForeignKey('brand_authors', foreignKey);
    }

    if (await queryRunner.hasTable('articles')) {
      await queryRunner.dropTable('articles');
    }

    if (await queryRunner.hasTable('brand_authors')) {
      await queryRunner.dropTable('brand_authors');
    }
  }
}
