@extends('layouts.app')

@section('header')
    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        {{ $formation->title }}
    </h2>
@endsection

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
             @if($formation->image_url)
                <img src="{{ $formation->image_url }}" alt="{{ $formation->title }}" class="w-full h-64 object-cover">
            @endif
            <div class="p-6 bg-white border-b border-gray-200">
                <div class="mb-4">
                    <span class="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2">{{ $formation->category ? $formation->category->name : 'General' }}</span>
                    <span class="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-700 mr-2">{{ $formation->duration }} ({{ $formation->duration_type }})</span>
                    @if($formation->price)
                        <span class="inline-block bg-yellow-200 rounded-full px-3 py-1 text-sm font-semibold text-yellow-700 mr-2">{{ $formation->price }} €</span>
                    @endif
                </div>

                <h3 class="text-2xl font-bold mb-4">Description</h3>
                <div class="prose max-w-none mb-6">
                    {!! nl2br(e($formation->description)) !!}
                </div>

                @if($formation->methodology)
                    <h3 class="text-xl font-bold mb-2">Methodology</h3>
                    <p class="mb-4">{!! nl2br(e($formation->methodology)) !!}</p>
                @endif

                @if($formation->inclusions)
                    <h3 class="text-xl font-bold mb-2">Inclusions</h3>
                    <p class="mb-4">{!! nl2br(e($formation->inclusions)) !!}</p>
                @endif

                @if($formation->program_link)
                    <div class="mt-6">
                        <a href="{{ $formation->program_link }}" target="_blank" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Download Program PDF
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
