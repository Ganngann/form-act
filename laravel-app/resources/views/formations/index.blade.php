@extends('layouts.app')

@section('header')
    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Formations
    </h2>
@endsection

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @foreach($formations as $formation)
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    @if($formation->image_url)
                        <img src="{{ $formation->image_url }}" alt="{{ $formation->title }}" class="w-full h-48 object-cover">
                    @else
                        <div class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    @endif
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-2">{{ $formation->title }}</h3>
                        <p class="text-gray-700 text-base mb-4 truncate">
                            {{ Str::limit($formation->description, 100) }}
                        </p>
                        <div class="flex justify-between items-center">
                            <span class="text-sm bg-gray-200 rounded-full px-3 py-1 text-gray-700 font-semibold mr-2">{{ $formation->category ? $formation->category->name : 'General' }}</span>
                            <a href="{{ route('formations.show', $formation->id) }}" class="text-blue-500 hover:text-blue-800 font-semibold">Details</a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
        <div class="mt-6">
            {{ $formations->links() }}
        </div>
    </div>
</div>
@endsection
