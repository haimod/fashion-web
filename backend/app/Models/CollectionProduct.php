<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionProduct extends Model
{
    protected $table = 'CHITIET_BST';
    protected $primaryKey = 'ma_bst';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
