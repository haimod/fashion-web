<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashSaleItem extends Model
{
    protected $table = 'CHITIET_FLASHSALE';
    protected $primaryKey = 'ma_fs';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
