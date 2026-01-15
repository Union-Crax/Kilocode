# CLI Utilities

This directory contains utility functions and helpers used throughout the Kilocode CLI.

## Files

### Error Handling

- **`errors.ts`** - Custom error classes and error handling utilities
    - Provides typed error classes: `TaskAbortedError`, `ValidationError`, `ConfigurationError`, `NetworkError`, `TimeoutError`, `FileOperationError`
    - Includes type guards and helper functions for safe error handling
    - Replaces fragile string-matching error detection with proper type-based checking

### Timeout Protection

- **`timeout.ts`** - Utilities for protecting async operations from hanging
    - `withTimeout()` - Wraps promises with timeout protection
    - `withTimeoutGuard()` - Creates timeout-protected function wrappers
    - `retryWithTimeout()` - Retries operations with timeout and delay between attempts
    - Prevents hanging network operations and provides better error messages

### Other Utilities

- **`auto-update.ts`** - CLI auto-update functionality
- **`context.ts`** - Context management utilities
- **`env-loader.ts`** - Environment variable loading
- **`extension-paths.ts`** - Path resolution for extension files
- **`git.ts`** - Git-related utilities
- **`notifications.ts`** - Notification handling
- **`paths.ts`** - Path utilities and constants
- **`providers.ts`** - Provider-related utilities
- **`safe-stringify.ts`** - Safe JSON stringification with circular reference handling
- **`time.ts`** - Time and date utilities
- **`wait.ts`** - Async waiting utilities

## Usage Examples

### Error Handling

```typescript
import { TaskAbortedError, isTaskAbortedError, getErrorMessage } from "./utils/errors.js"

// Throwing a typed error
throw new TaskAbortedError("User cancelled the operation")

// Type-safe error checking
try {
	await someOperation()
} catch (error) {
	if (isTaskAbortedError(error)) {
		// Handle task abortion gracefully
		return
	}
	// Handle other errors
	console.error(getErrorMessage(error))
}
```

### Timeout Protection

```typescript
import { withTimeout, retryWithTimeout } from "./utils/timeout.js"

// Protect a single operation
const result = await withTimeout(
	fetchUserProfile(token),
	5000, // 5 second timeout
	"fetch user profile",
)

// Retry with timeout
const data = await retryWithTimeout(() => makeApiCall(), {
	maxAttempts: 3,
	timeoutMs: 5000,
	retryDelayMs: 1000,
	operationName: "API call",
	onRetry: (attempt, error) => {
		console.log(`Retry attempt ${attempt} after error: ${error.message}`)
	},
})
```

## Best Practices

1. **Always use typed errors** - Use the custom error classes instead of throwing generic `Error` objects
2. **Add timeout protection to network calls** - Use `withTimeout()` to prevent hanging operations
3. **Use type guards** - Use `isTaskAbortedError()` and similar guards instead of checking error messages
4. **Format errors for logging** - Use `formatErrorForLogging()` to get consistent error output
