import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { parseCreatePositionsFailure } from '../../src/api/positions';

const axiosError = (
  data: Record<string, unknown>,
  status = 400,
): AxiosError => {
  const error = new AxiosError(
    'Request failed',
    AxiosError.ERR_BAD_REQUEST,
    undefined,
    undefined,
    {
      status,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data,
    },
  );
  return error;
};

describe('parseCreatePositionsFailure', () => {
  it('returns a generic message for non-axios errors', () => {
    expect(parseCreatePositionsFailure(new Error('Network down'))).toEqual({
      errors: [],
      generalMessages: ['Network down'],
    });
  });

  it('reads errorMessage and row errors from a flat 400 body', () => {
    const result = parseCreatePositionsFailure(
      axiosError({
        received: 1,
        inserted: 0,
        rejected: 1,
        errorMessage: 'One or more positions failed validation',
        errors: [{ index: 0, reasons: ['Latitude must be less than or equal to 90'] }],
      }),
    );

    expect(result.generalMessages).toEqual([
      'One or more positions failed validation',
    ]);
    expect(result.errors).toEqual([
      { index: 0, reasons: ['Latitude must be less than or equal to 90'] },
    ]);
  });

  it('unwraps Nest-style nested message payloads', () => {
    const result = parseCreatePositionsFailure(
      axiosError({
        message: {
          errorMessage: 'Batch rejected',
          errors: [{ index: 1, reasons: ['Duplicate timestamp in batch'] }],
        },
      }),
    );

    expect(result.generalMessages).toEqual(['Batch rejected']);
    expect(result.errors[0].index).toBe(1);
  });

  it('falls back to a string message when errorMessage is absent', () => {
    const result = parseCreatePositionsFailure(
      axiosError({ message: 'Bad Request', errors: [] }),
    );

    expect(result.generalMessages).toEqual(['Bad Request']);
    expect(result.errors).toEqual([]);
  });
});
