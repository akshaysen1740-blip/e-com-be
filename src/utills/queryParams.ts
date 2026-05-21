import { z } from "zod";

export type QueryParams<TFilters = {}> = TFilters & {
  page?: number;
  limit?: number;
};

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const preprocessNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return value;
  }

  const parsedValue =
    typeof value === "string" ? Number(value.trim()) : Number(value);

  return Number.isNaN(parsedValue) ? value : parsedValue;
};

const positiveIntNumber = (fieldLabel: string) =>
  z.preprocess(
    preprocessNumber,
    z
      .number({ error: `${fieldLabel} must be a valid number` })
      .int(`${fieldLabel} must be an integer`)
      .positive(`${fieldLabel} must be a positive number`),
  );

export const optionalPositiveIntNumber = (fieldLabel: string) =>
  z.preprocess(preprocessNumber, positiveIntNumber(fieldLabel).optional());

export const paginationQuerySchema = z.object({
  page: optionalPositiveIntNumber("Page"),
  limit: optionalPositiveIntNumber("Limit"),
});

export const createPaginationQuerySchema = <T extends z.ZodRawShape>(
  filters: T,
) => z.object(filters).merge(paginationQuerySchema);

export const normalizePagination = (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): PaginationParams => {
  const normalizedPage =
    Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
  const normalizedLimit =
    Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_LIMIT;
  const safeLimit = Math.min(normalizedLimit, MAX_LIMIT);

  return {
    page: normalizedPage,
    limit: safeLimit,
    offset: (normalizedPage - 1) * safeLimit,
  };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
