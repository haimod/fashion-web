<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'SANPHAM';
    protected $primaryKey = 'ma_sp';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
