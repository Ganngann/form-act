<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'category_id',
        'title',
        'description',
        'level',
        'duration',
        'duration_type',
        'program_link',
        'price',
        'methodology',
        'inclusions',
        'agreement_codes',
        'image_url',
        'is_expertise',
        'is_published',
    ];

    protected $casts = [
        'agreement_codes' => 'array',
        'is_expertise' => 'boolean',
        'is_published' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function authorizedTrainers(): BelongsToMany
    {
        return $this->belongsToMany(Formateur::class, 'formation_formateur', 'formation_id', 'formateur_id');
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class);
    }
}
