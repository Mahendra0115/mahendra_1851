import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddArticleStatusAndPublishedAt1763450000000 implements MigrationInterface {
  name = 'AddArticleStatusAndPublishedAt1763450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasStatusColumn = await queryRunner.hasColumn('articles', 'status');
    if (!hasStatusColumn) {
      await queryRunner.addColumn(
        'articles',
        new TableColumn({
          name: 'status',
          type: 'enum',
          enumName: 'articles_status_enum',
          enum: ['DRAFT', 'PUBLISHED'],
          default: "'DRAFT'",
        }),
      );
    }

    const hasPublishedAtColumn = await queryRunner.hasColumn(
      'articles',
      'publishedAt',
    );
    if (!hasPublishedAtColumn) {
      await queryRunner.addColumn(
        'articles',
        new TableColumn({
          name: 'publishedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('articles', 'publishedAt')) {
      await queryRunner.dropColumn('articles', 'publishedAt');
    }

    if (await queryRunner.hasColumn('articles', 'status')) {
      await queryRunner.dropColumn('articles', 'status');
    }
  }
}
