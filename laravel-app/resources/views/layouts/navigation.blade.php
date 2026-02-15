@php
$user = Auth::user();
$dashboardRoute = 'dashboard';
if ($user && $user->role === 'ADMIN') $dashboardRoute = 'admin.dashboard';
if ($user && $user->role === 'TRAINER') $dashboardRoute = 'trainer.dashboard';
if ($user && $user->role === 'CLIENT') $dashboardRoute = 'client.dashboard';
@endphp

<nav class="bg-white border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <!-- Logo -->
                <div class="shrink-0 flex items-center">
                    <a href="{{ route($dashboardRoute) }}" class="font-bold text-xl text-gray-800">
                        App
                    </a>
                </div>

                <!-- Navigation Links -->
                <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                    <a href="{{ route($dashboardRoute) }}" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out {{ request()->routeIs($dashboardRoute) ? 'border-indigo-400 text-gray-900 focus:outline-none focus:border-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300' }}">
                        Dashboard
                    </a>

                    @if ($user->role === 'ADMIN')
                        <a href="{{ route('formations.index') }}" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out {{ request()->routeIs('formations.*') ? 'border-indigo-400 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700' }}">
                            Formations
                        </a>
                        <a href="{{ route('sessions.index') }}" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out {{ request()->routeIs('sessions.*') ? 'border-indigo-400 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700' }}">
                            Sessions
                        </a>
                    @elseif ($user->role === 'TRAINER' || $user->role === 'CLIENT')
                        <a href="{{ route('sessions.index') }}" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out {{ request()->routeIs('sessions.*') ? 'border-indigo-400 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700' }}">
                            My Sessions
                        </a>
                    @endif
                </div>
            </div>

            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ml-6">
                <div class="ml-3 relative">
                    <div class="flex items-center">
                         <span class="mr-4 text-sm text-gray-600">{{ $user->name }}</span>
                         <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="text-sm text-red-600 hover:text-red-900 underline">
                                Log Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</nav>
