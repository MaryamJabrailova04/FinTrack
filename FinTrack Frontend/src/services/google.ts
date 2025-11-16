let googleScriptLoaded = false;

export function loadGoogleScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (googleScriptLoaded || (window as any).google) {
			googleScriptLoaded = true;
			resolve();
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			googleScriptLoaded = true;
			resolve();
		};
		script.onerror = () => reject(new Error('Failed to load Google script'));
		document.head.appendChild(script);
	});
}

export async function getGmailAccessToken(): Promise<string> {
	await loadGoogleScript();
	const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
	if (!clientId) {
		throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
	}
	return await new Promise((resolve, reject) => {
		const google = (window as any).google;
		if (!google?.accounts?.oauth2) {
			reject(new Error('Google OAuth2 not available'));
			return;
		}
		try {
			const tokenClient = google.accounts.oauth2.initTokenClient({
				client_id: clientId,
				scope: 'https://www.googleapis.com/auth/gmail.readonly',
				callback: (resp: any) => {
					if (resp && resp.access_token) {
						resolve(resp.access_token);
					} else {
						reject(new Error('No access token returned'));
					}
				},
				prompt: 'consent',
			});
			tokenClient.requestAccessToken();
		} catch (e) {
			reject(e);
		}
	});
}

export async function getGoogleIdToken(): Promise<string> {
	await loadGoogleScript();
	const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
	if (!clientId) {
		throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
	}
	return await new Promise((resolve, reject) => {
		try {
			const google = (window as any).google;
			if (!google?.accounts?.id) {
				reject(new Error('Google Identity Services not available'));
				return;
			}
			google.accounts.id.initialize({
				client_id: clientId,
				callback: (resp: any) => {
					const cred = resp?.credential;
					if (typeof cred === 'string' && cred.length > 0) {
						resolve(cred);
					} else {
						reject(new Error('No credential returned'));
					}
				},
				auto_select: false,
				use_fedcm_for_prompt: true,
			});
			// Request prompt; if user selects an account and approves, callback will fire
			google.accounts.id.prompt();
		} catch (e) {
			reject(e);
		}
	});
}

export async function renderGoogleButton(container: HTMLElement, onCredential: (idToken: string) => void) {
	await loadGoogleScript();
	const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
	if (!clientId) {
		throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
	}
	const google = (window as any).google;
	if (!google?.accounts?.id) {
		throw new Error('Google Identity Services not available');
	}
	container.innerHTML = '';
	google.accounts.id.initialize({
		client_id: clientId,
		callback: (resp: any) => {
			const cred = resp?.credential;
			if (typeof cred === 'string' && cred.length > 0) {
				onCredential(cred);
			}
		},
	});
	google.accounts.id.renderButton(container, {
		theme: 'outline',
		size: 'large',
		type: 'standard',
		text: 'continue_with',
		shape: 'rectangular',
		logo_alignment: 'left',
	});
}


