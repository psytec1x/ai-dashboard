export function SetupScreen() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full card-panel p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-accent-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-semibold">AI</span>
        </div>
        <h1 className="text-h2 mb-2">AI Dashboard</h1>
        <p className="text-sm text-text-muted mb-6">
          One step left: add your Clerk publishable key to enable sign-in.
        </p>
        <ol className="text-left text-sm text-text-secondary space-y-2 mb-6">
          <li><span className="text-accent-hover font-medium">1.</span> Create a free app at dashboard.clerk.com</li>
          <li><span className="text-accent-hover font-medium">2.</span> Copy the publishable key</li>
          <li><span className="text-accent-hover font-medium">3.</span> Set <code className="text-mono-sm bg-black/30 px-1.5 py-0.5 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="text-mono-sm bg-black/30 px-1.5 py-0.5 rounded">.env</code> (see .env.example)</li>
          <li><span className="text-accent-hover font-medium">4.</span> Restart the dev server / redeploy</li>
        </ol>
        <p className="text-xs text-text-subtle">
          Deploying to Cloudflare Pages? Add the variable under Settings → Environment variables.
        </p>
      </div>
    </div>
  );
}
