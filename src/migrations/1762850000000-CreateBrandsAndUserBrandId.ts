import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateBrandsAndUserBrandId1762850000000
  implements MigrationInterface
{
  name = 'CreateBrandsAndUserBrandId1762850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsersTable = await queryRunner.hasTable('users');
    if (!hasUsersTable) {
      await queryRunner.createTable(
        new Table({
          name: 'users',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'email', type: 'varchar', isUnique: true },
            { name: 'password', type: 'varchar' },
            {
              name: 'role',
              type: 'enum',
              enumName: 'users_role_enum',
              enum: ['ADMIN', 'BRAND'],
              default: "'BRAND'",
            },
            { name: 'fullName', type: 'varchar', isNullable: true },
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

    const hasBrandsTable = await queryRunner.hasTable('brands');
    if (!hasBrandsTable) {
      await queryRunner.createTable(
        new Table({
          name: 'brands',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'name', type: 'varchar' },
            { name: 'description', type: 'text' },
            { name: 'logoUrl', type: 'varchar' },
            { name: 'createdById', type: 'integer' },
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

    const hasBrandIdColumn = await queryRunner.hasColumn('users', 'brandId');
    if (!hasBrandIdColumn) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'brandId',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    await queryRunner.createForeignKey(
      'brands',
      new TableForeignKey({
        name: 'FK_brands_createdById_users_id',
        columnNames: ['createdById'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_users_brandId_brands_id',
        columnNames: ['brandId'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const usersTable = await queryRunner.getTable('users');
    const brandsTable = await queryRunner.getTable('brands');

    const usersBrandForeignKey = usersTable?.foreignKeys.find(
      (foreignKey) => foreignKey.name === 'FK_users_brandId_brands_id',
    );
    if (usersBrandForeignKey) {
      await queryRunner.dropForeignKey('users', usersBrandForeignKey);
    }

    const brandsCreatedByForeignKey = brandsTable?.foreignKeys.find(
      (foreignKey) => foreignKey.name === 'FK_brands_createdById_users_id',
    );
    if (brandsCreatedByForeignKey) {
      await queryRunner.dropForeignKey('brands', brandsCreatedByForeignKey);
    }

    if (await queryRunner.hasColumn('users', 'brandId')) {
      await queryRunner.dropColumn('users', 'brandId');
    }

    if (await queryRunner.hasTable('brands')) {
      await queryRunner.dropTable('brands');
    }
  }
}
