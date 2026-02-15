<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ClientController extends Controller
{
    use AuthorizesRequests;

    public function show(Client $client)
    {
        $this->authorize('view', $client);
        return view('clients.show', compact('client'));
    }

    public function update(Request $request, Client $client)
    {
        $this->authorize('update', $client);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'address' => 'required|string',
            'vat_number' => 'required|string|max:20',
        ]);

        $client->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }
}
