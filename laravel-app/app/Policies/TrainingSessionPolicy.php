<?php

namespace App\Policies;

use App\Models\TrainingSession;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TrainingSessionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TrainingSession $trainingSession): bool
    {
        if ($user->role === 'ADMIN') {
            return true;
        }

        if ($user->role === 'TRAINER' && $user->formateur && $trainingSession->trainer_id === $user->formateur->id) {
            return true;
        }

        if ($user->role === 'CLIENT' && $user->client && $trainingSession->client_id === $user->client->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'ADMIN';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TrainingSession $trainingSession): bool
    {
        if ($user->role === 'ADMIN') {
            return true;
        }

        if ($user->role === 'TRAINER' && $user->formateur && $trainingSession->trainer_id === $user->formateur->id) {
            return true;
        }

        if ($user->role === 'CLIENT' && $user->client && $trainingSession->client_id === $user->client->id) {
            return $trainingSession->is_logistics_open;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TrainingSession $trainingSession): bool
    {
        return $user->role === 'ADMIN';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TrainingSession $trainingSession): bool
    {
        return $user->role === 'ADMIN';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TrainingSession $trainingSession): bool
    {
        return $user->role === 'ADMIN';
    }
}
