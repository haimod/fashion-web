<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    protected $table = 'DIACHI_KH';
    protected $primaryKey = 'ma_dc';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
