import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  FindManyOptions,
  QueryRunner,
  FindOneOptions,
} from 'typeorm';
import { IBaseRepository } from '../types/base-repository.interface';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  // protected abstract readonly logger: Logger;

  constructor(protected readonly repository: Repository<T>) {}

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  async create(data: DeepPartial<T>, queryRunner?: QueryRunner): Promise<T> {
    const created = this.repository.create(data);

    if (queryRunner) {
      const saved = await queryRunner.manager.save(created);
      return saved;
    }

    return await this.repository.save(created);
  }

  async createMany(
    data: DeepPartial<T>[],
    queryRunner?: QueryRunner,
  ): Promise<T[]> {
    const created = this.repository.create(data);

    if (queryRunner) {
      return await queryRunner.manager.save(created);
    }

    return await this.repository.save(created);
  }

  async findOne(
    filterQuery: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T | null> {
    const record = await this.repository.findOne({
      where: filterQuery,
      ...options,
    });

    return record;
  }

  async find(options?: FindManyOptions<T> | FindOptionsWhere<T>): Promise<T[]> {
    if (!options) {
      return await this.repository.find(); // No filter
    }

    // If 'options' is a plain object and does not have 'where', treat it as a 'where' clause
    if (!('where' in options)) {
      return await this.repository.find({
        where: options as FindOptionsWhere<T>,
      });
    }

    return await this.repository.find(options as FindManyOptions<T>);
  }

  async findMany(
    options?: FindManyOptions<T> | FindOptionsWhere<T>,
  ): Promise<T[]> {
    if (!options) {
      return await this.repository.find();
    }

    // If it's a plain object with no query-specific keys, treat it as `where`
    const isPlainWhere =
      typeof options === 'object' &&
      !(
        'skip' in options ||
        'take' in options ||
        'order' in options ||
        'relations' in options ||
        'select' in options ||
        'where' in options
      );

    if (isPlainWhere) {
      return await this.repository.find({
        where: options as FindOptionsWhere<T>,
      });
    }

    return await this.repository.find(options as FindManyOptions<T>);
  }

  async update(
    filterQuery: FindOptionsWhere<T>,
    payload: QueryDeepPartialEntity<T>,
    queryRunner?: QueryRunner,
  ): Promise<T> {
    if (queryRunner) {
      await queryRunner.manager.update(
        this.repository.target,
        filterQuery,
        payload,
      );
      return await queryRunner.manager.findOneBy(
        this.repository.target,
        filterQuery,
      );
    }

    await this.repository.update(filterQuery, payload);
    return await this.repository.findOneBy(filterQuery);
  }

  merge<T>(target: T, source: Partial<T>): T {
    return Object.assign(target, source);
  }

  async save(data: DeepPartial<T>, queryRunner?: QueryRunner): Promise<T> {
    if (queryRunner) {
      const entity = this.repository.create(data);
      return await queryRunner.manager.save(entity);
    }

    return await this.repository.save(data);
  }

  async delete(
    where: FindOptionsWhere<T>,
    queryRunner?: QueryRunner,
  ): Promise<number> {
    if (queryRunner) {
      const result = await queryRunner.manager.delete(
        this.repository.target,
        where,
      );
      return result.affected || 0;
    }

    const result = await this.repository.delete(where);
    return result.affected || 0;
  }

  async softDelete(
    where: FindOptionsWhere<T>,
    queryRunner?: QueryRunner,
  ): Promise<number> {
    if (queryRunner) {
      const result = await queryRunner.manager.softDelete(
        this.repository.target,
        where,
      );
      return result.affected || 0;
    }

    const result = await this.repository.softDelete(where);
    return result.affected || 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }

  async advancedCount(
    options?: FindManyOptions<T> | FindOptionsWhere<T>,
  ): Promise<number> {
    if (!options) {
      return await this.repository.count();
    }

    // If it's a plain object with no query-specific keys, treat it as `where`
    const isPlainWhere =
      typeof options === 'object' &&
      !(
        'skip' in options ||
        'take' in options ||
        'order' in options ||
        'relations' in options ||
        'select' in options ||
        'where' in options
      );

    if (isPlainWhere) {
      return await this.repository.count({
        where: options as FindOptionsWhere<T>,
      });
    }

    return await this.repository.count(options as FindManyOptions<T>);
  }

  async truncate(tableName: string, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      await queryRunner.query(`TRUNCATE TABLE ${tableName}`);
    } else {
      await this.repository.query(`TRUNCATE TABLE ${tableName}`);
    }
  }
}
