<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $table = 'GIOHANG';
    protected $primaryKey = 'ma_gh';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
