<?php

namespace App\Policies;

use App\Models\Formateur;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FormateurPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Formateur $formateur): bool
    {
        return $user->role === 'ADMIN' || ($user->role === 'TRAINER' && $formateur->user_id === $user->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Formateur $formateur): bool
    {
        return $user->role === 'ADMIN' || ($user->role === 'TRAINER' && $formateur->user_id === $user->id);
    }
}
