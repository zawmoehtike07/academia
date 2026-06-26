import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="w-20 h-20 bg-[#0f766e] text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-900/20 transform -rotate-6">
          <span className="text-4xl font-bold font-serif">A</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          Welcome to <span className="text-[#0f766e]">Academia</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
          Your ultimate collaborative study platform. Track your focus, join study groups, and ace your exams together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/login" 
            className="px-8 py-4 bg-white text-[#0f766e] font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 transition shadow-sm"
          >
            Log In
          </Link>
          <Link 
            to="/register" 
            className="px-8 py-4 bg-[#0f766e] text-white font-semibold rounded-2xl hover:bg-teal-800 transition shadow-lg shadow-teal-900/20"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
