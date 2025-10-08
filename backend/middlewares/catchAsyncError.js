// This middleware wrapper handles errors from async functions and passes them to the global error middleware.
export const catchAsyncError = (theFunc) => (req, res, next) => {
    // Resolve the promise, and if an error occurs, pass it to the 'next' middleware (the error handler).
    Promise.resolve(theFunc(req, res, next)).catch(next);
};
