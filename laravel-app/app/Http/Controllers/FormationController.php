<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class FormationController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $formations = Formation::where('is_published', true)->paginate(12);
        return view('formations.index', compact('formations'));
    }

    public function show(Formation $formation)
    {
        return view('formations.show', compact('formation'));
    }
}
