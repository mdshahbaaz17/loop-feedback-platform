export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      
      <div className="bg-white dark:bg-black p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Workspace Profile</h3>
        <p className="text-sm text-gray-500">Manage your workspace details and preferences.</p>
        
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <label className="block text-sm font-medium mb-1">Workspace Name</label>
            <input type="text" className="w-full max-w-md p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-transparent" defaultValue="Acme Corp Workspace" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Support Email</label>
            <input type="email" className="w-full max-w-md p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-transparent" defaultValue="support@acmecorp.com" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
