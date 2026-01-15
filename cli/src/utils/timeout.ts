// kilocode_change - new file
/**
 * Timeout utilities for protecting async operations from hanging indefinitely
 */

import { TimeoutError } from "./errors.js"

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve/reject within
 * the specified time, throws a TimeoutError.
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operationName - Optional name for the operation (used in error message)
 * @returns The resolved value of the promise
 * @throws TimeoutError if the timeout expires before the promise settles
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName?: string): Promise<T> {
	let timeoutId: NodeJS.Timeout

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => {
			const message = operationName
				? `Operation '${operationName}' timed out after ${timeoutMs}ms`
				: `Operation timed out after ${timeoutMs}ms`
			reject(new TimeoutError(message, timeoutMs))
		}, timeoutMs)
	})

	try {
		return await Promise.race([promise, timeoutPromise])
	} finally {
		clearTimeout(timeoutId!)
	}
}

/**
 * Wraps a function with a default timeout. Useful for ensuring all calls
 * to a particular operation have timeout protection.
 *
 * @param fn - The async function to wrap
 * @param defaultTimeoutMs - Default timeout in milliseconds
 * @param operationName - Optional name for the operation
 * @returns A wrapped function with timeout protection
 */
export function withTimeoutGuard<TArgs extends unknown[], TReturn>(
	fn: (...args: TArgs) => Promise<TReturn>,
	defaultTimeoutMs: number,
	operationName?: string,
): (...args: TArgs) => Promise<TReturn> {
	return async (...args: TArgs): Promise<TReturn> => {
		return withTimeout(fn(...args), defaultTimeoutMs, operationName)
	}
}

/**
 * Options for retry with timeout
 */
export interface RetryWithTimeoutOptions {
	/** Maximum number of retry attempts */
	maxAttempts: number
	/** Timeout for each attempt in milliseconds */
	timeoutMs: number
	/** Delay between retries in milliseconds */
	retryDelayMs?: number
	/** Optional name for the operation */
	operationName?: string
	/** Optional callback invoked before each retry */
	onRetry?: (attempt: number, error: Error) => void
}

/**
 * Retries an async operation with timeout protection for each attempt.
 * Useful for network operations that might hang or fail intermittently.
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration
 * @returns The resolved value of the operation
 * @throws The last error if all attempts fail
 */
export async function retryWithTimeout<T>(fn: () => Promise<T>, options: RetryWithTimeoutOptions): Promise<T> {
	const { maxAttempts, timeoutMs, retryDelayMs = 1000, operationName, onRetry } = options

	let lastError: Error | undefined

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await withTimeout(fn(), timeoutMs, operationName)
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error))

			// If this is the last attempt, throw the error
			if (attempt === maxAttempts) {
				throw lastError
			}

			// Invoke retry callback if provided
			if (onRetry) {
				onRetry(attempt, lastError)
			}

			// Wait before retrying
			if (retryDelayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
			}
		}
	}

	// This should never be reached, but TypeScript requires it
	throw lastError || new Error("All retry attempts failed")
}
