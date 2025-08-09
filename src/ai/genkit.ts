import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {servicesConfig} from '@/config/services';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // The default behavior is to swallow errors and log them to the trace.
  // This is not always desirable, so we throw the error instead.
  // We also want to expose the status code to the client.
  // See: https://firebase.google.com/docs/genkit/errors
  // Note: We are only throwing on "permanent" failures, which are unlikely to
  // succeed on retry. We can add more error codes here if we want to.
  // A full list of error codes can be found here:
  // https://github.com/firebase/genkit/blob/main/js/core/src/error.ts
  onError: async (err: GenkitError) => {
    const permanentFailureErrors: GenkitErrorCode[] = [
        'aborted', 'invalid-argument', 'not-found', 'already-exists',
        'permission-denied', 'unauthenticated', 'failed-precondition',
        'out-of-range', 'unimplemented',
    ];
    if (permanentFailureErrors.includes(err.code)) {
        throw err;
    }
  }
});
