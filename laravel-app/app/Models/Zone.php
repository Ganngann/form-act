<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Zone extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'code'];

    public function formateursPredilection(): BelongsToMany
    {
        return $this->belongsToMany(Formateur::class, 'predilection_zones', 'zone_id', 'formateur_id');
    }

    public function formateursExpertise(): BelongsToMany
    {
        return $this->belongsToMany(Formateur::class, 'expertise_zones', 'zone_id', 'formateur_id');
    }
}
