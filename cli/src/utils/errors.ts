// kilocode_change - new file
/**
 * Custom error classes for better error handling and type safety across the CLI
 */

/**
 * Base class for all CLI-specific errors
 */
export class CLIError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		public readonly context?: Record<string, unknown>,
	) {
		super(message)
		this.name = this.constructor.name
		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor)
		}
	}
}

/**
 * Error thrown when a task is aborted/cancelled by the user
 */
export class TaskAbortedError extends CLIError {
	constructor(message: string = "Task was aborted", context?: Record<string, unknown>) {
		super(message, "TASK_ABORTED", context)
	}
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends CLIError {
	constructor(
		message: string,
		public readonly field?: string,
		context?: Record<string, unknown>,
	) {
		super(message, "VALIDATION_ERROR", { ...context, field })
	}
}

/**
 * Error thrown when configuration is invalid or missing
 */
export class ConfigurationError extends CLIError {
	constructor(message: string, context?: Record<string, unknown>) {
		super(message, "CONFIG_ERROR", context)
	}
}

/**
 * Error thrown when a network operation fails
 */
export class NetworkError extends CLIError {
	constructor(
		message: string,
		public readonly statusCode?: number,
		context?: Record<string, unknown>,
	) {
		super(message, "NETWORK_ERROR", { ...context, statusCode })
	}
}

/**
 * Error thrown when a timeout occurs
 */
export class TimeoutError extends CLIError {
	constructor(
		message: string,
		public readonly timeoutMs?: number,
		context?: Record<string, unknown>,
	) {
		super(message, "TIMEOUT_ERROR", { ...context, timeoutMs })
	}
}

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends CLIError {
	constructor(
		message: string,
		public readonly filePath?: string,
		context?: Record<string, unknown>,
	) {
		super(message, "FILE_ERROR", { ...context, filePath })
	}
}

/**
 * Type guard to check if an error is a CLIError
 */
export function isCLIError(error: unknown): error is CLIError {
	return error instanceof CLIError
}

/**
 * Type guard to check if an error is a TaskAbortedError
 */
export function isTaskAbortedError(error: unknown): error is TaskAbortedError {
	return error instanceof TaskAbortedError
}

/**
 * Safely extract error message from any error type
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message || "Unknown error occurred"
	}
	if (typeof error === "string") {
		return error
	}
	if (error && typeof error === "object" && "message" in error) {
		return String((error as { message: unknown }).message)
	}
	return String(error)
}

/**
 * Safely extract error stack from any error type
 */
export function getErrorStack(error: unknown): string | undefined {
	if (error instanceof Error) {
		return error.stack
	}
	return undefined
}

/**
 * Format error for logging with all available context
 */
export function formatErrorForLogging(error: unknown): {
	message: string
	stack?: string
	code?: string
	context?: Record<string, unknown>
} {
	if (isCLIError(error)) {
		// kilocode_change - Fix TypeScript exactOptionalPropertyTypes error
		// Only include optional properties if they have defined values
		const result: {
			message: string
			stack?: string
			code?: string
			context?: Record<string, unknown>
		} = {
			message: error.message,
		}
		if (error.stack !== undefined) {
			result.stack = error.stack
		}
		if (error.code !== undefined) {
			result.code = error.code
		}
		if (error.context !== undefined) {
			result.context = error.context
		}
		return result
		// kilocode_change end
	}

	// kilocode_change - Fix TypeScript exactOptionalPropertyTypes error
	const result: {
		message: string
		stack?: string
	} = {
		message: getErrorMessage(error),
	}
	const stack = getErrorStack(error)
	if (stack !== undefined) {
		result.stack = stack
	}
	return result
	// kilocode_change end
}
