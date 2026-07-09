import Sidebar from "../components/Sidebar";

const Reports = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab="reports" />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 md:px-8 z-10 sticky top-0">
          <h2 className="text-xl text-slate-800 font-semibold">Reports</h2>
        </header>
        <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-slate-400">Reports</h1>
        </main>
      </div>
    </div>
  );
};

export default Reports;
