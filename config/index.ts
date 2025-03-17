import { z } from 'zod';

const envVars = z.object({
	NEXT_PUBLIC_APP_NAME: z.string(),
	// NEXT_PUBLIC_APP_URL: z.string(),
	NEXT_PUBLIC_APP_SLOGAN: z.string(),
	NEXT_PUBLIC_APP_DESCRIPTION: z.string(),
	MONGODB_URI: z.string(),
});

envVars.parse(process.env);

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		//eslint-disable @typescript-eslint/no-empty-interface
		interface ProcessEnv extends z.infer<typeof envVars> {}
	}
}
