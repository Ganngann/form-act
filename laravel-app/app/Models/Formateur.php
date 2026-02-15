<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formateur extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'address',
        'bio',
        'avatar_url',
        'calendar_token',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function predilectionZones(): BelongsToMany
    {
        return $this->belongsToMany(Zone::class, 'predilection_zones', 'formateur_id', 'zone_id');
    }

    public function expertiseZones(): BelongsToMany
    {
        return $this->belongsToMany(Zone::class, 'expertise_zones', 'formateur_id', 'zone_id');
    }

    public function authorizedFormations(): BelongsToMany
    {
        return $this->belongsToMany(Formation::class, 'formation_formateur', 'formateur_id', 'formation_id');
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class, 'trainer_id');
    }
}
