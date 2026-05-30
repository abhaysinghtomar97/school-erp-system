



const DashboardSkeleton = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">

            {/* Top Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200"></div>

                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {[1,2,3,4].map((item) => (
                                <div
                                    key={item}
                                    className="h-20 bg-gray-100 rounded"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map((item) => (
                    <div
                        key={item}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-28"
                    >
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <div className="space-y-4">
                        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-10 bg-gray-100 rounded"></div>
                        <div className="h-28 bg-gray-100 rounded"></div>
                        <div className="h-10 bg-gray-100 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <div className="space-y-5">
                        {[1,2,3].map((item) => (
                            <div
                                key={item}
                                className="p-4 border border-gray-100 rounded-lg"
                            >
                                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardSkeleton;