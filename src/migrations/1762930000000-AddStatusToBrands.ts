import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusToBrands1762930000000 implements MigrationInterface {
  name = 'AddStatusToBrands1762930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasStatusColumn = await queryRunner.hasColumn('brands', 'status');
    if (!hasStatusColumn) {
      await queryRunner.addColumn(
        'brands',
        new TableColumn({
          name: 'status',
          type: 'enum',
          enumName: 'brands_status_enum',
          enum: ['APPROVED', 'DISAPPROVED'],
          default: "'DISAPPROVED'",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasStatusColumn = await queryRunner.hasColumn('brands', 'status');
    if (hasStatusColumn) {
      await queryRunner.dropColumn('brands', 'status');
    }
  }
}
