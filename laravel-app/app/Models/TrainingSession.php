<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSession extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'training_sessions';

    protected $fillable = [
        'formation_id',
        'trainer_id',
        'client_id',
        'date',
        'slot',
        'status',
        'location',
        'logistics',
        'is_logistics_open',
        'participants',
        'proof_url',
        'billed_at',
        'billing_data',
    ];

    protected $casts = [
        'date' => 'datetime',
        'logistics' => 'array',
        'is_logistics_open' => 'boolean',
        'participants' => 'array',
        'billed_at' => 'datetime',
        'billing_data' => 'array',
    ];

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Formateur::class, 'trainer_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function isLogisticsStrictlyComplete(): bool
    {
        if (empty($this->logistics)) {
            return false;
        }

        $required = ['access', 'wifi', 'videoMaterial'];
        foreach ($required as $field) {
            if (empty($this->logistics[$field])) {
                return false;
            }
        }
        return true;
    }
}
