// Response helper functions

export function successResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}

export function errorResponse(code: string, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

export function paginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
) {
  return {
    success: true,
    data: {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
}
