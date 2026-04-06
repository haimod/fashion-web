<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $table = 'BIENTHE_SP';
    protected $primaryKey = 'ma_bien_the';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
