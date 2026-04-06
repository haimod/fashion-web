<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $table = 'CHITIET_GIOHANG';
    protected $primaryKey = 'ma_gh';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
