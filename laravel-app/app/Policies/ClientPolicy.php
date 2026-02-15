<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClientPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Client $client): bool
    {
        return $user->role === 'ADMIN' || ($user->role === 'CLIENT' && $client->user_id === $user->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Client $client): bool
    {
        return $user->role === 'ADMIN' || ($user->role === 'CLIENT' && $client->user_id === $user->id);
    }
}
