/*eslint-disable @typescript-eslint/no-explicit-any*/
import { FindOptionsWhere } from 'typeorm';
import { QueryOptions } from '../types';

export class QueryParser {
  private static readonly EXCLUDED_FIELDS = [
    'sort',
    'fields',
    'limit',
    'page',
    'search',
  ];

  static parseFilterQuery(queryString: QueryOptions): FindOptionsWhere<any> {
    const queryObject = { ...queryString };

    // Remove excluded fields
    this.EXCLUDED_FIELDS.forEach((field) => delete queryObject[field]);

    // Remove empty values
    Object.keys(queryObject).forEach(
      (key) =>
        (queryObject[key] === undefined || queryObject[key] === '') &&
        delete queryObject[key],
    );

    // Parse operators
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    return JSON.parse(queryStr);
  }

  static parseSortQuery(sortString?: string): Record<string, 'ASC' | 'DESC'> {
    if (!sortString) {
      return { createdAt: 'DESC' };
    }

    const sort: Record<string, 'ASC' | 'DESC'> = {};
    sortString.split(',').forEach((field: string) => {
      if (field.startsWith('-')) {
        sort[field.substring(1)] = 'DESC';
      } else {
        sort[field] = 'ASC';
      }
    });

    return sort;
  }

  static parseFieldsQuery(fieldsString?: string): string[] | undefined {
    return fieldsString?.split(',');
  }

  static parsePaginationQuery(
    page?: string,
    limit?: string,
  ): { take: number; skip: number } {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const skip = (parsedPage - 1) * parsedLimit;

    return { take: parsedLimit, skip };
  }
}
