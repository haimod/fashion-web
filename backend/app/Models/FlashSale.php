<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashSale extends Model
{
    protected $table = 'FLASH_SALE';
    protected $primaryKey = 'ma_fs';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
