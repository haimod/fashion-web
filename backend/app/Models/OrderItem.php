<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $table = 'CHITIET_DH';
    protected $primaryKey = 'ma_dh';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
