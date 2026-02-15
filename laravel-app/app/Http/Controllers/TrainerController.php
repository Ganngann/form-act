<?php

namespace App\Http\Controllers;

use App\Models\Formateur;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TrainerController extends Controller
{
    use AuthorizesRequests;

    public function show(Formateur $trainer)
    {
        $this->authorize('view', $trainer);
        return view('trainers.show', compact('trainer'));
    }

    public function update(Request $request, Formateur $trainer)
    {
        $this->authorize('update', $trainer);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'bio' => 'nullable|string',
        ]);

        $trainer->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }
}
