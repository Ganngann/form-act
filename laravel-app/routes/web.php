<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\TrainingSessionController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TrainerController;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'login'])->name('login');
    Route::post('login', [AuthController::class, 'authenticate']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');

    // Admin Dashboard
    Route::middleware(CheckRole::class . ':ADMIN')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', function () { return view('admin.dashboard'); })->name('dashboard');
    });

    // Trainer Dashboard
    Route::middleware(CheckRole::class . ':TRAINER')->prefix('trainer')->name('trainer.')->group(function () {
        Route::get('dashboard', function () { return view('trainer.dashboard'); })->name('dashboard');
    });

    // Client Dashboard
    Route::middleware(CheckRole::class . ':CLIENT')->prefix('client')->name('client.')->group(function () {
        Route::get('dashboard', function () { return view('client.dashboard'); })->name('dashboard');
    });

    // Formations
    Route::resource('formations', FormationController::class)->only(['index', 'show']);

    // Sessions
    Route::resource('sessions', TrainingSessionController::class)->only(['index', 'show']);
    Route::get('sessions/{session}/ics', [TrainingSessionController::class, 'generateICS'])->name('sessions.ics');
    Route::get('sessions/{session}/print', [TrainingSessionController::class, 'print'])->name('sessions.print');

    // Clients Profile
    Route::resource('clients', ClientController::class)->only(['show', 'update']);

    // Trainers Profile
    Route::resource('trainers', TrainerController::class)->only(['show', 'update']);
});
